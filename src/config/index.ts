import { GraphQLClient } from 'graphql-request'

export const endpoint = 'https://graph.ices.one/v1/graphql'
export const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': 'df8UEfMjqN6apt',
    },
})