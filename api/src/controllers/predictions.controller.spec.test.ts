import { beforeEach, after, describe, it } from "node:test";
import { prisma, type User, type Match, type Prediction } from "../lib/prisma.ts";
import assert from "node:assert";
import { generateFakeUser, generateTestUuid } from "../../test/index.ts";
// import { adminRequester, buildAuthedRequester, generateFakeUser } from "../../test/index.ts";

describe("predictions.controller", async () => {
  let users: User[];
  // let userRequester: ReturnType<typeof buildAuthedRequester>;
  let match: Match;
  let prediction: Prediction;
  let index: number = 0;

  users = await prisma.user.createMany({
    data: [
      generateFakeUser(),
      generateFakeUser()
    ]
  })
  // userRequester = buildAuthedRequester(user);

  // Création d'un match pour les tests
  match = await prisma.match.create({
    data: {
      date: "2025-09-16T14:45:00.000Z",
      home_team_id: "69fa30b9-1a1e-4fbd-a813-f14bfb45d79b",
      away_team_id: "21f03c76-4e0b-45e8-a659-740b3fdc097a",
      competition_id: "777525f1-4052-4279-8a9b-eacc2933c185"
    }
  });

  prediction = await prisma.prediction.create({
    data: {
      id: "449869d2-fd19-4a05-8e11-2b9aeabb498b",
      user_id: user.id,
      match_id: match.id,
      prediction_value: "HOME"
    }
  });
  // beforeEach(async () => {
  //   // Création d'un utilisateur pour les tests
    
  // });

  after(async () => {
    await prisma.user.delete({
      where: { id: user.id },
    });
  });

  describe("[GET] /api/predictions", async () => {
    describe("with query parameters user_id and match_id", () => {
      it("should return the prediction for a specific user and match", async () => {
        const response = await fetch(`http://localhost:4000/api/predictions?user_id=${user.id}&match_id=${match.id}`);
        const predictionData = await response.json();

        const data = predictionData;

        assert.equal(response.status, 200);
        assert.equal(data.id, prediction.id);
        assert.equal(data.prediction_value, "HOME");
      });
      it("should return prediction with match details", async () => {
        const response = await fetch(`http://localhost:4000/api/predictions?user_id=${user.id}&match_id=${match.id}`);
        const predictionData = await response.json();

        const data = predictionData;

        assert.equal(response.status, 200);
        assert.ok(data.match);
        assert.ok(data.match.home_team);
        assert.ok(data.match.away_team);
        assert.ok(data.match.competition);
      });

      it("should return prediction with user details", async () => {
        const response = await fetch(`http://localhost:4000/api/predictions?user_id=${user.id}&match_id=${match.id}`);
        const predictionData = await response.json();

        const data = predictionData;

        assert.equal(response.status, 200);
        assert.ok(data.user);
        assert.equal(data.user.id, user.id);
        assert.equal(data.user.username, user.username);
        assert.ok(data.user.avatar_url !== undefined);
      });

      it("should return 404 when prediction does not exist", async () => {
        const response = await fetch(`http://localhost:4000/api/predictions?user_id=69fa30b9-1a1e-4fbd-a813-000000000000&match_id=${match.id}`);
        const predictionData = await response.json();

        const data = predictionData;

        assert.equal(response.status, 404);
        assert.equal(data.error, "Pas de pronostic pour ce match");
      });

      it("should return 400 when user_id is not a valid UUID", async () => {
        const response = await fetch(`http://localhost:4000/api/predictions?user_id=invalid-uuid&match_id=${match.id}`);
        const predictionData = await response.json();

        const data = predictionData;

        assert.equal(response.status, 400);
        assert.ok(data.error);
      });

      it("should return 400 when match_id is not a valid UUID", async () => {
        const response = await fetch(`http://localhost:4000/api/predictions?user_id=${user.id}&match_id=invalid-uuid`);
        const predictionData = await response.json();

        const data = predictionData;

        assert.equal(response.status, 400);
        assert.ok(data.error);
      });
    });
  });

  // describe("[GET] /api/predictions (all)", () => {
  //   it("should return all predictions from the database", async () => {
  //     const user2 = await prisma.user.create({ data: generateFakeUser() });
  //     await prisma.prediction.createMany({
  //       data: [
  //         { user_id: user.id, match_id: match.id, prediction_value: "HOME" },
  //         { user_id: user2.id, match_id: match.id, prediction_value: "AWAY" },
  //       ]
  //     });

  //     const { status, data: predictions } = await adminRequester.get("/predictions");

  //     assert.equal(status, 200);
  //     assert.equal(predictions.length, 2);
  //   });

  //   it("should return an empty array when there are no predictions", async () => {
  //     const { data: predictions } = await adminRequester.get("/predictions");

  //     assert.deepStrictEqual(predictions, []);
  //   });

  //   it("should return predictions ordered by updated_at desc", async () => {
  //     const prediction1 = await prisma.prediction.create({
  //       data: {
  //         user_id: user.id,
  //         match_id: match.id,
  //         prediction_value: "HOME"
  //       }
  //     });

  //     // Attendre un peu pour avoir des timestamps différents
  //     await new Promise(resolve => setTimeout(resolve, 10));

  //     const prediction2 = await prisma.prediction.create({
  //       data: {
  //         user_id: user.id,
  //         match_id: match.id,
  //         prediction_value: "DRAW"
  //       }
  //     });

  //     const { data: predictions } = await adminRequester.get("/predictions");

  //     assert.equal(predictions[0].id, prediction2.id);
  //     assert.equal(predictions[1].id, prediction1.id);
  //   });

  //   it("should include match and user details for each prediction", async () => {
  //     await prisma.prediction.create({
  //       data: {
  //         user_id: user.id,
  //         match_id: match.id,
  //         prediction_value: "HOME"
  //       }
  //     });

  //     const { data: predictions } = await adminRequester.get("/predictions");

  //     assert.ok(predictions[0].match);
  //     assert.ok(predictions[0].match.home_team);
  //     assert.ok(predictions[0].match.away_team);
  //     assert.ok(predictions[0].match.competition);
  //     assert.ok(predictions[0].user);
  //     assert.equal(predictions[0].user.id, user.id);
  //   });
  // });
});

//   describe("[GET] /api/predictions/:id", () => {
//     it("should return the requested prediction with all basic properties", async () => {
//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "HOME"
//         }
//       });

//       const { status, data } = await adminRequester.get(`/predictions/${prediction.id}`);

//       assert.equal(status, 200);
//       assert.equal(data.id, prediction.id);
//       assert.equal(data.user_id, user.id);
//       assert.equal(data.match_id, match.id);
//       assert.equal(data.prediction_value, "HOME");
//     });

//     it("should return the prediction with match details", async () => {
//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "DRAW"
//         }
//       });

//       const { data } = await adminRequester.get(`/predictions/${prediction.id}`);

//       assert.ok(data.match);
//       assert.ok(data.match.home_team);
//       assert.ok(data.match.away_team);
//       assert.ok(data.match.competition);
//     });

//     it("should return the prediction with user details", async () => {
//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "AWAY"
//         }
//       });

//       const { data } = await adminRequester.get(`/predictions/${prediction.id}`);

//       assert.ok(data.user);
//       assert.equal(data.user.id, user.id);
//       assert.equal(data.user.username, user.username);
//     });

//     it("should return 404 when the prediction does not exist", async () => {
//       const UNEXISTING_UUID = "00000000-0000-0000-0000-000000000000";

//       const { status, data } = await adminRequester.get(`/predictions/${UNEXISTING_UUID}`);

//       assert.equal(status, 404);
//       assert.deepStrictEqual(data.error, ["Prediction not found"]);
//     });

//     it("should return 400 when the id is not a valid UUID", async () => {
//       const { status, data } = await adminRequester.get("/predictions/invalid-uuid");

//       assert.equal(status, 400);
//       assert.ok(data.error);
//     });

//     it("should be accessible by any user (public route)", async () => {
//       const otherUser = await prisma.user.create({ data: generateFakeUser() });
//       const otherUserRequester = buildAuthedRequester(otherUser);

//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "HOME"
//         }
//       });

//       const { status } = await otherUserRequester.get(`/predictions/${prediction.id}`);

//       assert.equal(status, 200);
//     });
//   });

//   describe("[POST] /api/predictions (upsert)", () => {
//     it("should create a new prediction with valid data", async () => {
//       const PREDICTION_DATA = {
//         user_id: user.id,
//         match_id: match.id,
//         prediction_value: "HOME"
//       };

//       const { status, data } = await userRequester.post("/predictions", PREDICTION_DATA);

//       assert.equal(status, 200);
//       assert.ok(data.id);
//       assert.equal(data.user_id, user.id);
//       assert.equal(data.match_id, match.id);
//       assert.equal(data.prediction_value, "HOME");
//     });

//     it("should update an existing prediction (upsert)", async () => {
//       // Créer une première prédiction
//       await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "HOME"
//         }
//       });

//       // Tenter de créer une autre prédiction pour le même user/match
//       const UPDATED_PREDICTION = {
//         user_id: user.id,
//         match_id: match.id,
//         prediction_value: "AWAY"
//       };

//       const { status, data } = await userRequester.post("/predictions", UPDATED_PREDICTION);

//       assert.equal(status, 200);
//       assert.equal(data.prediction_value, "AWAY");

//       // Vérifier qu'il n'y a toujours qu'une seule prédiction
//       const allPredictions = await prisma.prediction.findMany({
//         where: { user_id: user.id, match_id: match.id }
//       });
//       assert.equal(allPredictions.length, 1);
//     });

//     it("should accept DRAW as prediction value", async () => {
//       const PREDICTION_DATA = {
//         user_id: user.id,
//         match_id: match.id,
//         prediction_value: "DRAW"
//       };

//       const { status, data } = await userRequester.post("/predictions", PREDICTION_DATA);

//       assert.equal(status, 200);
//       assert.equal(data.prediction_value, "DRAW");
//     });

//     it("should return 400 when prediction_value is invalid", async () => {
//       const INVALID_PREDICTION = {
//         user_id: user.id,
//         match_id: match.id,
//         prediction_value: "INVALID"
//       };

//       const { status, data } = await userRequester.post("/predictions", INVALID_PREDICTION);

//       assert.equal(status, 400);
//       assert.ok(data.error);
//     });

//     it("should return 400 when user_id is not a valid UUID", async () => {
//       const INVALID_DATA = {
//         user_id: "invalid-uuid",
//         match_id: match.id,
//         prediction_value: "HOME"
//       };

//       const { status } = await userRequester.post("/predictions", INVALID_DATA);

//       assert.equal(status, 400);
//     });

//     it("should return 400 when match_id is not a valid UUID", async () => {
//       const INVALID_DATA = {
//         user_id: user.id,
//         match_id: "invalid-uuid",
//         prediction_value: "HOME"
//       };

//       const { status } = await userRequester.post("/predictions", INVALID_DATA);

//       assert.equal(status, 400);
//     });

//     it("should return 403 when user tries to create prediction for another user", async () => {
//       const otherUser = await prisma.user.create({ data: generateFakeUser() });
//       const PREDICTION_FOR_OTHER_USER = {
//         user_id: otherUser.id,
//         match_id: match.id,
//         prediction_value: "HOME"
//       };

//       const { status, data } = await userRequester.post("/predictions", PREDICTION_FOR_OTHER_USER);

//       assert.equal(status, 403);
//       assert.equal(data.error, "Vous ne pouvez créer ou modifier que vos propres pronostics");
//     });

//     it("should allow admin to create prediction for any user", async () => {
//       const otherUser = await prisma.user.create({ data: generateFakeUser() });
//       const PREDICTION_FOR_OTHER_USER = {
//         user_id: otherUser.id,
//         match_id: match.id,
//         prediction_value: "HOME"
//       };

//       const { status } = await adminRequester.post("/predictions", PREDICTION_FOR_OTHER_USER);

//       assert.equal(status, 200);
//     });

//     it("should return 400 when required fields are missing", async () => {
//       const { status } = await userRequester.post("/predictions", {});

//       assert.equal(status, 400);
//     });
//   });

//   describe("[DELETE] /api/predictions/:id", () => {
//     it("should delete the prediction from the database", async () => {
//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "HOME"
//         }
//       });

//       const { status } = await userRequester.delete(`/predictions/${prediction.id}`);

//       assert.equal(status, 204);

//       const remainingPredictions = await prisma.prediction.count();
//       assert.equal(remainingPredictions, 0);
//     });

//     it("should allow user to delete their own prediction", async () => {
//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "HOME"
//         }
//       });

//       const { status } = await userRequester.delete(`/predictions/${prediction.id}`);

//       assert.equal(status, 204);
//     });

//     it("should return 403 when user tries to delete another user's prediction", async () => {
//       const otherUser = await prisma.user.create({ data: generateFakeUser() });
//       const otherUserRequester = buildAuthedRequester(otherUser);

//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "HOME"
//         }
//       });

//       const { status, data } = await otherUserRequester.delete(`/predictions/${prediction.id}`);

//       assert.equal(status, 403);
//       assert.equal(data.error, "Vous ne pouvez supprimer que vos propres pronostics");
//     });

//     it("should allow admin to delete any prediction", async () => {
//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "HOME"
//         }
//       });

//       const { status } = await adminRequester.delete(`/predictions/${prediction.id}`);

//       assert.equal(status, 204);
//     });

//     it("should return 404 when the prediction does not exist", async () => {
//       const UNEXISTING_UUID = "00000000-0000-0000-0000-000000000000";

//       const { status, data } = await userRequester.delete(`/predictions/${UNEXISTING_UUID}`);

//       assert.equal(status, 404);
//       assert.equal(data.error, "Pronostic non trouvé");
//     });

//     it("should return 400 when the id is not a valid UUID", async () => {
//       const { status, data } = await userRequester.delete("/predictions/invalid-uuid");

//       assert.equal(status, 400);
//       assert.ok(data.error);
//     });

//     it("should effectively remove the prediction from database", async () => {
//       const prediction = await prisma.prediction.create({
//         data: {
//           user_id: user.id,
//           match_id: match.id,
//           prediction_value: "HOME"
//         }
//       });

//       await userRequester.delete(`/predictions/${prediction.id}`);

//       const deletedPrediction = await prisma.prediction.findUnique({
//         where: { id: prediction.id }
//       });
//       assert.equal(deletedPrediction, null);
//     });
//   });
// });