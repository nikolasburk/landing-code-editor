/**
 * Explanation: `index.js` is the start script for your GraphQL server. In this example, it contains the implementation of the resolver functions which are required for the queries and mutations defined in `schema.graphql`.
 */

const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

// Notice that the structure of the `resolver` object is identical to the `Query` and `Mutation` types in `schema.graphql`.
// Each resolver simply delegates the incoming queries and mutation to Prisma by accessing a `db` object on `context`. This is the `Prisma` binding instance which is attached to the `context` upon initialization of the `GraphQLServer` (which happens at the end of this file).
const resolvers = {
  Query: {
    feed(parent, args, context, info) {
      // This generates a `posts` query from the Prisma GraphQL API.
      return context.db.query.posts({ where: { isPublished: true } }, info)
    },
    post(parent, { id }, context, info) {
      // This generates a `post` query from the Prisma GraphQL API.
      return context.db.query.post({ where: { id } }, info)
    },
  },
  Mutation: {
    createDraft(parent, { title, text }, context, info) {
      // This generates a `createPost` mutation from the Prisma GraphQL API.
      return context.db.mutation.createPost(
        {
          data: {
            title,
            text,
          },
        },
        info,
      )
    },
    publish(parent, { id }, context, info) {
      // This generates a `updatePost` mutation from the Prisma GraphQL API.
      return context.db.mutation.updatePost(
        {
          where: { id },
          data: { isPublished: true },
        },
        info,
      )
    },
  },
}

// Instantiate the `GraphQLServer` with the application schema (`schema.graphql`) and `resolver` functions.
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    // Attach the `Prisma` binding instance to the `context` so the resolvers get access to it.
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql', // The auto-generated Prisma GraphQL schema
      endpoint: '__PRISMA_ENDPOINT__',          // The endpoint of the Prisma API
      secret: 'mysecret123',                    // The `secret` from `prisma.yml`
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))