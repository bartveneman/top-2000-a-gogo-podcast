const got = require('got')
const { fromSingleDto: fromEpisodeDto } = require('./episodes')

function fromDto(dto) {
  if (!dto) throw new TypeError('Expected a `seasons` object to transform')
  if (dto.total === 0) return []

  return dto.items.map(seasonDto => {
    return {
      name: seasonDto.seasonName,
      episodes: seasonDto.episodesCollection.items.map(fromEpisodeDto)
    }
  })
}

module.exports = async function seasons() {
  const query = `
    query allSeasons {
      podcastSeasonCollection(limit: 10, order:sys_publishedAt_ASC) {
        total
        items {
          seasonName
          episodesCollection {
            total
            items {
              title
              description
              mediaUri
              relatedMedia
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
  return fromDto(response.data.podcastSeasonCollection)
}
