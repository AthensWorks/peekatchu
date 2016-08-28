module FacesApp exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import WebSocket

type alias Model =
  { frame : String }

type Msg
  = SocketFrame String

init : ( Model, Cmd Msg )
init =
  ( Model "Waiting for server...", Cmd.none )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    SocketFrame frame ->
      ( Model frame, Cmd.none )

subscriptions : Model -> Sub Msg
subscriptions model =
  WebSocket.listen "ws://localhost:8001" SocketFrame

view : Model -> Html Msg
view model =
  div []
    [ pre [] [ text model.frame ] ]

main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }
