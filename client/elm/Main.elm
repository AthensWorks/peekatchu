module Elm exposing (..)

import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import WebSocket

type alias Model =
  { faces : String }

type Msg
  = NewFaceCount String

init : ( Model, Cmd Msg )
init =
  ( Model "Waiting for server...", Cmd.none )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    NewFaceCount faces ->
      ( Model faces, Cmd.none )

subscriptions : Model -> Sub Msg
subscriptions model =
  WebSocket.listen "ws://localhost:8001" NewFaceCount

view : Model -> Html Msg
view model =
  div []
    [ pre [] [ text model.faces ] ]

main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }


