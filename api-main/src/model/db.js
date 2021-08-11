/**
 * @file db.js
 *
 * Helper functions to interface with the database
 */

const db = require("better-sqlite3")('./database/walkspan.sqlite', {readonly: true});
const distanceToLineSegment = require("distance-to-line-segment");
const { sortBy } = require("underscore");

const { getBoundingBoxFromCoordinatesAndRange } = require('../lib/geocoder');

/**
 * Gets the closest sidewalk to a pair of GPS coordinates
 *
 * @param latitude The latitude of the point
 * @param longitude The longitude of the point
 * @returns The database entry for the closest sidewalk
 */
module.exports.getClosestSidewalk = (latitude, longitude) => {
    /**
     * Try to approximate the 8 closest sidewalks to the latitude and longitude
     * We can't retrieve 1 here because it's difficult to query for the closest
     * as the GPS coordinates may be within the middle of a sidewalk with the edge
     * of an intersection right next to that point
     */
    const sidewalkCandidates = db.prepare(`
        SELECT
            natural_beauty_score,
            manmade_beauty_score,
            comfort_score,
            interest_score,
            safety_score,
            access_score,
            amenities_score,
            sidewalk_starting_longitude,
            sidewalk_ending_longitude,
            sidewalk_starting_latitude,
            sidewalk_ending_latitude 
        FROM Walkspan
        ORDER BY MIN(
            ABS(sidewalk_starting_latitude - :latitude) + ABS(sidewalk_starting_longitude - :longitude),
            ABS(sidewalk_ending_latitude - :latitude) + ABS(sidewalk_ending_longitude - :longitude)
        ) ASC LIMIT 8;
    `).all({
        latitude: latitude,
        longitude: longitude
    });

    // Get the closest sidewalk of the returned dataset from our query
    return sortBy(sidewalkCandidates, sidewalkCandidate => {
        return distanceToLineSegment(
            sidewalkCandidate.sidewalk_starting_latitude,
            sidewalkCandidate.sidewalk_starting_longitude,
            sidewalkCandidate.sidewalk_ending_latitude,
            sidewalkCandidate.sidewalk_ending_longitude,
            latitude,
            longitude);
    })[0];
};

/**
 * Get all sidewalks within a radius of gps coordinates
 *
 * @param latitude The latitude of the point
 * @param longitude The longitude of the point
 * @param range The range we want all sidewalks within
 * @returns The set of all sidewalks within the query
 */
module.exports.getSidewalksInRadius = (latitude, longitude, range) => {

    // Get's the bounding box for the inputs
    const { topLat, bottomLat, leftLng, rightLng } = getBoundingBoxFromCoordinatesAndRange(latitude, longitude, range);

    // Query for all sidewalks within the bounding box
    return db.prepare(`
        SELECT
            natural_beauty_score,
            manmade_beauty_score,
            comfort_score,
            interest_score,
            safety_score,
            access_score,
            amenities_score,
            sidewalk_starting_longitude,
            sidewalk_ending_longitude,
            sidewalk_starting_latitude,
            sidewalk_ending_latitude 
        FROM Walkspan
        WHERE (
            :bottomLat <= sidewalk_starting_latitude AND sidewalk_starting_latitude <= :topLat AND
            :leftLng <= sidewalk_starting_longitude AND sidewalk_starting_longitude <= :rightLng
        ) OR (
            :bottomLat <= sidewalk_ending_latitude AND sidewalk_ending_latitude <= :topLat AND
            :leftLng <= sidewalk_ending_longitude AND sidewalk_ending_longitude <= :rightLng
        );
    `).all({
        topLat,
        bottomLat,
        leftLng,
        rightLng
    });

}
