require('dotenv').config()
const got = require('got')
const { fromDto: fromEpisodeDto } = require('./episodes')

function fromDto(dto) {
  if (dto.total === 0) return []

  return dto.items.map(seasonDto => {
    const { seasonName: name, number } = seasonDto

    return {
      name,
      number,
      episodes: seasonDto.episodesCollection.items.map(episode => fromEpisodeDto({
        ...episode,
        linkedFrom: {
          podcastSeasonCollection: {
            items: [seasonDto]
          }
        }
      }))
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
          number
          episodesCollection {
            total
            items {
              number
              title
              description
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

module.exports.fromDto = fromDto
