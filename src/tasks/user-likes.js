import axios from 'axios';
import createURI from 'urijs';
import { chunk } from 'lodash';
import batchPromises from 'batch-promises';
import tmp from 'tmp';
import id3 from 'node-id3';
import path from 'path';
import fs from 'fs';

import createSoundCloudClient from '../clients/soundcloud';
import createSoundCloudClientV2 from '../clients/soundcloud-v2';

const LIKES_LIMIT = 10;

const getUser = async (client, { user }) => {
    const { data } = await client.get(`/resolve`, {
        params: {
            url: `https://soundcloud.com/${user}`,
        }
    });

    return data;
};

const getAllLikes = async (client, user, offset, likeCollection = []) => {
    const { data } = await client.get(`/users/${user.id}/likes`, {
        params: {
            limit: LIKES_LIMIT,
            offset,
        },
    });

    likeCollection = likeCollection.concat(data.collection);

    console.log('Fetched', likeCollection.length, 'likes');

    // if (data.next_href) {
    //     const { offset } = createURI(data.next_href).search(true);
    //
    //     return getAllLikes(client, user, offset, likeCollection);
    // }

    return likeCollection;
};

const getArtwork = async (track, directory) => {
    const artworkStream = await axios({
        method: 'GET',
        url: track.artwork_url,
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const fileName = path.join(directory, `${track.permalink}.jpg`);
        console.log('Writing', fileName);

        const writeStream = fs.createWriteStream(fileName);

        artworkStream.data.pipe(writeStream);

        writeStream.on('error', (err) => {
            reject(err);
        });

        writeStream.on('close', () => {
            console.log('Done writing!', fileName);

            resolve(fileName);
        });
    });
};


const getTrack = async (client, track, artwork, directory) => {
    const { data } = await client.get(`i1/tracks/${track.id}/streams`);

    const mp3Stream = await axios({
        method: 'GET',
        url: data.http_mp3_128_url,
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const fileName = path.join(directory, `${track.permalink}.mp3`);
        console.log('Writing', fileName);

        const writeStream = fs.createWriteStream(fileName);

        mp3Stream.data.pipe(writeStream);

        writeStream.on('error', (err) => {
            reject(err);
        });

        writeStream.on('close', () => {
            console.log('Done writing!', fileName);

            console.log(track.user);

            id3.write({
                title: track.title,
                artist: track.user.username,
                image: artwork,
                genre: track.tag_list,
                comment: `${track.permalink_url}\n\n${track.description}`,
            }, fileName);

            resolve(fileName);
        });
    });
};

export default async (answers) => {
    const client = createSoundCloudClient();
    const clientV2 = createSoundCloudClientV2();

    const user = await getUser(client, answers);

    const likes = await getAllLikes(clientV2, user);

    console.log('Fetched all', likes.length, 'likes');

    const temporary = tmp.dirSync();

    console.log(answers);
    await batchPromises(answers.batchSize, likes,
        like => getArtwork(like.track, temporary.name).catch((err) => {
            console.log('Failed fetching artwork for', like.track.permalink, err.message);

            return null;
        }).then((artwork) => getTrack(client, like.track, artwork, temporary.name))
    );
};
