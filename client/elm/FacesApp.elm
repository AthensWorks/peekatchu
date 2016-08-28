module FacesApp exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Events exposing (..)
import Json.Decode exposing
  ( Decoder
  , (:=)
  , decodeString
  , int
  , object5
  , string
  , list
  )
import WebSocket

type alias Face =
  { x             : Int
  , y             : Int
  , height        : Int
  , width         : Int
  , matchCount    : Int
  }

type alias Model =
  { faces : List Face
  , error : String
  }

type Msg
  = SocketFrame String

decodeFace =
  object5 Face
    ( "x"          := int )
    ( "y"          := int )
    ( "height"     := int )
    ( "width"      := int )
    ( "matchCount" := int )

decodeFrame =
  ( "faces" := (list decodeFace) )

init : ( Model, Cmd Msg )
init =
  ( Model [] "Waiting for server...", Cmd.none )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    SocketFrame frame ->
      case decodeString decodeFrame frame of
        Err msg ->
          ( { model | error = msg }, Cmd.none )
        Ok faces ->
          ( { model | faces = faces }, Cmd.none )

subscriptions : Model -> Sub Msg
subscriptions model =
  WebSocket.listen "ws://localhost:8001" SocketFrame

view : Model -> Html Msg
view model =
  div []
    [ pre [] [ text (toString (List.length model.faces)) ]
    , pre [] [ text model.error ]]

main =
  Html.program
    { init          = init
    , view          = view
    , update        = update
    , subscriptions = subscriptions
    }
