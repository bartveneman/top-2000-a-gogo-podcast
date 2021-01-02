require('dotenv').config()
const got = require('got')

function fromSingleDto({ title, description, relatedMedia, mediaUri }) {
  return {
    title,
    description,
    mediaUri,
    relatedMedia: Array.isArray(relatedMedia) ? relatedMedia.map(media => {
      const [provider, type, id] = media.split(':');
      return {
        uri: media,
        type,
        id,
        provider,
      }
    }) : [],
  }
}

module.exports = async function episodes() {
  const query = `
    query allEpisodes {
      podcastEpisodeCollection(order:sys_publishedAt_ASC) {
        total
        items {
          title
          description
          mediaUri
          relatedMedia
          linkedFrom {
            podcastSeasonCollection(limit: 1) {
              items {
                sys {
                  id
                }
                seasonName
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
  return response.data.podcastEpisodeCollection.items.map(fromSingleDto)
}

module.exports.fromSingleDto = fromSingleDto