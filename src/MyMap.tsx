import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
// @ts-ignore
import { compose, withProps } from 'recompose';
import { mapsApiKey } from './mapsApiKey';

interface MyMapProps {
  lat?: number;
  lng?: number;
  onMapClick: (e: any) => void,
  onMarkerClick: (e: any) => void,
}

export const MyMap =
  compose<MyMapProps, any>(
    withProps({
      googleMapURL:
        `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&v=3.exp&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `400px` }} />,
      mapElement: <div style={{ height: `100%` }} />
    }),
    withScriptjs,
    withGoogleMap
  )((props: { lat: any; lng: any; onMapClick: ((e: any) => void) | undefined; onMarkerClick: ((e: any) => void) | undefined; }) => {
      console.log(props.lat,props.lng)
      return (
    <GoogleMap
      defaultZoom={8}
      defaultCenter={{ lat: Number(props.lat), lng: Number(props.lng) }}
      onClick={props.onMapClick}
    >
      <Marker
        position={{ lat:  Number(props.lat), lng:  Number(props.lng) }}
        onClick={props.onMarkerClick}
      />
    </GoogleMap>
  )})
