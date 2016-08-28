module FacesApp exposing (..)

import Html exposing
  ( Html
  , div
  , li
  , pre
  , text
  , ul
  )
import Html.App as Html
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

decodeFace : Decoder Face
decodeFace =
  object5 Face
    ( "x"          := int )
    ( "y"          := int )
    ( "height"     := int )
    ( "width"      := int )
    ( "matchCount" := int )

decodeFrame : Decoder (List Face)
decodeFrame =
  ( "faces" := (list decodeFace) )

init : ( Model, Cmd Msg )
init =
  ( Model [] "", Cmd.none )

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
    [ pre [] [ text model.error ] 
    , ul [] (List.map viewFace model.faces)
    ]

viewFace : Face -> Html Msg
viewFace face =
  li []
    [ pre [] [ text (toString face) ]
    ]

main : Program Never
main =
  Html.program
    { init          = init
    , view          = view
    , update        = update
    , subscriptions = subscriptions
    }
