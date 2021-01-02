require('dotenv').config()
const got = require('got')

function fromRelatedMedia(mediaUri) {
  const [provider, type, id] = mediaUri.split(':')

  return {
    id,
    uri: mediaUri,
    provider,
    type
  }
}

function fromDto(episodeDto) {
  if (!episodeDto) throw new TypeError('Expected an `episodeDto');

  const { title, number, description, mediaUri, relatedMedia, linkedFrom } = episodeDto
  const [season] = linkedFrom.podcastSeasonCollection.items.map(({ seasonName, number }) => ({ name: seasonName, number }))

  return {
    title,
    description,
    number,
    mediaUri,
    relatedMedia: Array.isArray(relatedMedia) ? relatedMedia.map(fromRelatedMedia) : [],
    path: `s${season.number}e${number}`,
    season,
  }
}

module.exports = async function seasons() {
  const query = `
    query allEpisodes {
      podcastEpisodeCollection {
        items {
          title
          number
          description
          mediaUri
          relatedMedia
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