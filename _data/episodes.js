require('dotenv').config()
const got = require('got')

function fromRelatedMediaItem({ remoteLocation, title, timestamp }) {
  const [provider, type, id] = remoteLocation.split(':')

  return {
    id,
    uri: remoteLocation,
    provider,
    type,
    timestamp,
    title
  }
}

function fromDto(episodeDto) {
  if (!episodeDto) throw new TypeError('Expected an `episodeDto');

  const { title, number, description, mediaUri, mediaRefrencesCollection, linkedFrom } = episodeDto
  const [season] = linkedFrom.podcastSeasonCollection.items.map(({ seasonName, number }) => ({ name: seasonName, number }))
  const mediaReferences = mediaRefrencesCollection?.items.map(fromRelatedMediaItem)

  return {
    title,
    description,
    number,
    mediaUri,
    relatedMedia: mediaReferences,
    path: `s${season.number}e${number}`,
    season,
  }
}

module.exports = async function seasons() {
  const query = `
    query allEpisodes {
      podcastEpisodeCollection(order: sys_firstPublishedAt_ASC) {
        items {
          title
          number
          description
          mediaUri
          mediaRefrencesCollection {
            items {
              title
              timestamp
              remoteLocation
            }
          }
          linkedFrom {
            podcastSeasonCollection(limit: 1) {
              items {
                seasonName
                number
              }
            }
          }
        }
      }
    }
  `
  const headers = {
    Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
  }

  const response = await got.post({
    url: `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE}/environments/master`,
    headers,
    form: {
      query
    }
  }).json()

  return response.data.podcastEpisodeCollection.items.map(fromDto)
}

module.exports.fromDto = fromDto