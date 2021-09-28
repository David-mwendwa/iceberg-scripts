"use strict";


async function transcodeMediaObject({mediaObjectId}) {
    const resp = await graphql(`
    mutation {
      transcodeMediaObject (input: {
        clientMutationId: "0",
        filter: "pdf2htmlEx",
        mediaObjectId: "${mediaObjectId}"

      }) {
        mediaObject {
          id
          content
        }
      }
    }
`)

    return resp && resp.transcodeMediaObject && resp.transcodeMediaObject.mediaObject && {
        content: resp.transcodeMediaObject.mediaObject.content,
        id: resp.transcodeMediaObject.mediaObject.id
    };
}
