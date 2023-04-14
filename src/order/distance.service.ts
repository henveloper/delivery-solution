import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * wraps the google data matrix api
 */
@Injectable()
export class DistanceService {
    constructor(
        private readonly configService: ConfigService,
    ) {
        // pass
    }

    /**
     * @param origin 
     * @param destination 
     * @returns distance in meter
     */
    public async getRouteLength(origin: [string, string], destination: [string, string]): Promise<number> {
        const apiKey = this.configService.getOrThrow("GMAP_KEY");

        // https://developers.google.com/maps/documentation/distance-matrix/distance-matrix#maps_http_distancematrix_latlng-js
        const query = new URLSearchParams()
        query.set("destinations", destination.join(","));
        query.set("origins", origin.join(","));
        query.set("key", apiKey);

        const baseUrl = "https://maps.googleapis.com/maps/api/distancematrix/json";
        const url = `${baseUrl}?${query.toString()}`;

        // gmap type defintions
        type DistanceMatrixResponse = {
            rows: Array<DistanceMatrixRow>,
            status: DistanceMatrixStatus,
            error_message?: string,
        };
        type DistanceMatrixStatus =
            | "OK" // good to use
            | "INVALID_REQUEST" // our problem
            | "OVER_DAILY_LIMIT" // api key issue
        type DistanceMatrixRow = { elements: Array<DistanceMatrixElement> };
        type DistanceMatrixElement = {
            status: DistanceMatrixElementStatus,
            distance?: TextValueObject,
        }
        // https://developers.google.com/maps/documentation/distance-matrix/distance-matrix#DistanceMatrixElementStatus
        type DistanceMatrixElementStatus =
            | "OK" // good to use
            | "NOT_FOUND" // origin/dest cannot be geolocated
            | "ZERO_RESULTS" // no route found
            | "MAX_ROUTE_LENGTH_EXCEEDED" // route is too long to be processed
        type TextValueObject = {
            text: string,
            value: number,
        };

        const { data } = await axios.get<DistanceMatrixResponse>(url);

        if (data.status !== "OK") {
            throw new Error(`gmap query error - ${data.status}`);
        }

        const rowStatus = data.rows[0]!.elements[0]!.status;
        if (rowStatus !== "OK") {
            throw new Error(`gmap data error - ${rowStatus}`);
        }

        // without specifying the unit, it uses meters.
        return data.rows[0]!.elements[0]!.distance!.value;
    }
}
