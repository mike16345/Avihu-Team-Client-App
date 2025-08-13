export const MOCK_WORKOUT_PLAN = {
  _id: "11112222",
  userId: "11111111",
  tips: [
    "הקפד על חימום לפני תחילת האימון",
    "שתה מספיק מים במהלך היום",
    "שמור על טכניקה נכונה בכל תרגיל",
    "שלב בין אימוני כוח ואירובי",
    "הקשב לגוף שלך והימנע ממאמץ יתר",
    "שלב ימי מנוחה להתאוששות השרירים",
    "הגדל עומס בהדרגה ולא בבת אחת",
    "שמור על תזונה מאוזנת לאחר האימון",
    "השתמש בנעליים מתאימות לסוג האימון",
    "רשום את ההתקדמות שלך כדי לשמור על מוטיבציה",
    "נסה לגוון בתרגילים כדי למנוע שעמום",
    "נשום בצורה מבוקרת בזמן התרגילים",
  ],
  workoutPlans: [
    {
      planName: "אימון 1",
      muscleGroups: [
        {
          muscleGroup: "חזה - Bodyweight Workout",
          exercises: [
            {
              exerciseId: {
                _id: "6790b62a4e86f0a91457b4c7",
                name: "שכיבות סמיכה אחיזה רחבה ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=LkccOhA5lQ0&list=PLmXU6Fis3FcwSjIwDJNqqXX8W7WeyXH8v&index=18&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 10,
                  maxReps: 60,
                  _id: "689c351b10fac16c9c4a66c1",
                },
                {
                  minReps: 10,
                  maxReps: 60,
                  _id: "689c351b10fac16c9c4a66c2",
                },
                {
                  minReps: 10,
                  maxReps: 60,
                  _id: "689c351b10fac16c9c4a66c3",
                },
              ],
              exerciseMethod: "אימון כוח מתפרץ (Dynamic Effort)",
              restTime: 60,
              _id: "689c351b10fac16c9c4a66c0",
            },
          ],
          _id: "689c351b10fac16c9c4a66bf",
        },
        {
          muscleGroup: "כתפיים - Bodyweight Workout",
          exercises: [
            {
              exerciseId: {
                _id: "6790b1f94e86f0a91457b48b",
                name: "לחיצת כתפיים משקל גוף",
                linkToVideo:
                  "https://www.youtube.com/watch?v=gOj_lZVvRcU&list=PLmXU6Fis3FcwSjIwDJNqqXX8W7WeyXH8v&index=3&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 8,
                  maxReps: 12,
                  _id: "689c351b10fac16c9c4a66c6",
                },
                {
                  minReps: 8,
                  maxReps: 12,
                  _id: "689c351b10fac16c9c4a66c7",
                },
                {
                  minReps: 8,
                  maxReps: 12,
                  _id: "689c351b10fac16c9c4a66c8",
                },
              ],
              restTime: 60,
              _id: "689c351b10fac16c9c4a66c5",
            },
          ],
          _id: "689c351b10fac16c9c4a66c4",
        },
        {
          muscleGroup: "יד אחורית - Bodyweight Workout",
          exercises: [
            {
              exerciseId: {
                _id: "6790b8a24e86f0a91457b4e7",
                name: "ג׳קסונים על כיסא ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=pBAZUdhujwc&list=PLmXU6Fis3FcwSjIwDJNqqXX8W7WeyXH8v&index=26&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 20,
                  maxReps: 30,
                  _id: "689c351b10fac16c9c4a66cb",
                },
                {
                  minReps: 20,
                  maxReps: 30,
                  _id: "689c351b10fac16c9c4a66cc",
                },
                {
                  minReps: 20,
                  maxReps: 30,
                  _id: "689c351b10fac16c9c4a66cd",
                },
              ],
              restTime: 60,
              _id: "689c351b10fac16c9c4a66ca",
            },
          ],
          _id: "689c351b10fac16c9c4a66c9",
        },
        {
          muscleGroup: "גב - Bodyweight Workout",
          exercises: [
            {
              exerciseId: {
                _id: "6790b4674e86f0a91457b4af",
                name: "מתח באחיזה רחבה ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=9Y2HX9O4wfA&list=PLmXU6Fis3FcwSjIwDJNqqXX8W7WeyXH8v&index=12&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 12,
                  maxReps: 20,
                  _id: "689c351b10fac16c9c4a66d0",
                },
                {
                  minReps: 12,
                  maxReps: 20,
                  _id: "689c351b10fac16c9c4a66d1",
                },
                {
                  minReps: 12,
                  maxReps: 20,
                  _id: "689c351b10fac16c9c4a66d2",
                },
              ],
              restTime: 60,
              _id: "689c351b10fac16c9c4a66cf",
            },
          ],
          _id: "689c351b10fac16c9c4a66ce",
        },
        {
          muscleGroup: "יד קדמית - Bodyweight Workout",
          exercises: [
            {
              exerciseId: {
                _id: "6790b9274e86f0a91457b4eb",
                name: "כפיפה בתלייה על מוט - דגש ראש קצר",
                linkToVideo:
                  "https://www.youtube.com/watch?v=BHlF7LodOm4&list=PLmXU6Fis3FcwSjIwDJNqqXX8W7WeyXH8v&index=31&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 8,
                  maxReps: 15,
                  _id: "689c351b10fac16c9c4a66d5",
                },
                {
                  minReps: 8,
                  maxReps: 15,
                  _id: "689c351c10fac16c9c4a66d6",
                },
                {
                  minReps: 8,
                  maxReps: 15,
                  _id: "689c351c10fac16c9c4a66d7",
                },
              ],
              restTime: 60,
              _id: "689c351b10fac16c9c4a66d4",
            },
          ],
          _id: "689c351b10fac16c9c4a66d3",
        },
        {
          muscleGroup: "רגליים - Bodyweight Workout",
          exercises: [
            {
              exerciseId: {
                _id: "6790b8194e86f0a91457b4df",
                name: "סקוואטים משקל גוף ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=O38XZSMX3_w&list=PLmXU6Fis3FcwSjIwDJNqqXX8W7WeyXH8v&index=24&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 15,
                  maxReps: 30,
                  _id: "689c351c10fac16c9c4a66da",
                },
                {
                  minReps: 15,
                  maxReps: 30,
                  _id: "689c351c10fac16c9c4a66db",
                },
                {
                  minReps: 15,
                  maxReps: 30,
                  _id: "689c351c10fac16c9c4a66dc",
                },
              ],
              restTime: 60,
              _id: "689c351c10fac16c9c4a66d9",
            },
          ],
          _id: "689c351c10fac16c9c4a66d8",
        },
        {
          muscleGroup: "תאומים - Bodyweight Workout",
          exercises: [
            {
              exerciseId: {
                _id: "6790b30a4e86f0a91457b49b",
                name: "הרמות עקבים על מדרגה ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=2757nJ20UdQ&list=PLmXU6Fis3FcwSjIwDJNqqXX8W7WeyXH8v&index=7&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 20,
                  maxReps: 30,
                  _id: "689c351c10fac16c9c4a66df",
                },
                {
                  minReps: 20,
                  maxReps: 30,
                  _id: "689c351c10fac16c9c4a66e0",
                },
                {
                  minReps: 20,
                  maxReps: 30,
                  _id: "689c351c10fac16c9c4a66e1",
                },
              ],
              restTime: 60,
              _id: "689c351c10fac16c9c4a66de",
            },
          ],
          _id: "689c351c10fac16c9c4a66dd",
        },
        {
          muscleGroup: "בטן - ABS",
          exercises: [
            {
              exerciseId: {
                _id: "678380e771f41f83a6472368",
                name: "כפיפת גו ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=CGu56LCpAOU&list=PLmXU6Fis3FcxlQjZs30urrU2dVKVaCcQN&index=3&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 30,
                  _id: "689c351c10fac16c9c4a66e4",
                },
              ],
              restTime: 60,
              _id: "689c351c10fac16c9c4a66e3",
            },
            {
              exerciseId: {
                _id: "678380c571f41f83a6472364",
                name: "כפיפה באלכסון לרגל נגדית ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=9W_CZMUYxC8&list=PLmXU6Fis3FcxlQjZs30urrU2dVKVaCcQN&index=2&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 30,
                  _id: "689c351c10fac16c9c4a66e6",
                },
                {
                  minReps: 30,
                  _id: "689c351c10fac16c9c4a66e7",
                },
              ],
              tipFromTrainer: "לבצע 30 חזרות בכל צד - בשביל זה רשמתי 2 סטים ",
              restTime: 60,
              _id: "689c351c10fac16c9c4a66e5",
            },
            {
              exerciseId: {
                _id: "6783815371f41f83a6472378",
                name: "אופניים ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=oYSFJ0YpVBM&list=PLmXU6Fis3FcxlQjZs30urrU2dVKVaCcQN&index=7&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 30,
                  _id: "689c351c10fac16c9c4a66e9",
                },
              ],
              restTime: 60,
              _id: "689c351c10fac16c9c4a66e8",
            },
            {
              exerciseId: {
                _id: "6783813671f41f83a6472374",
                name: "כדור מצד לצד ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=dH6l1yidNJI&list=PLmXU6Fis3FcxlQjZs30urrU2dVKVaCcQN&index=6&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 30,
                  _id: "689c351c10fac16c9c4a66eb",
                },
              ],
              restTime: 60,
              _id: "689c351c10fac16c9c4a66ea",
            },
            {
              exerciseId: {
                _id: "6783810b71f41f83a6472370",
                name: "הרמות רגליים ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=2kTNN2USO_Y&list=PLmXU6Fis3FcxlQjZs30urrU2dVKVaCcQN&index=5&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 30,
                  _id: "689c351c10fac16c9c4a66ed",
                },
              ],
              restTime: 60,
              _id: "689c351c10fac16c9c4a66ec",
            },
            {
              exerciseId: {
                _id: "6783809c71f41f83a6472360",
                name: "פינגווין - כפיפה מצד לצד",
                linkToVideo:
                  "https://www.youtube.com/watch?v=2uRKrVdPv7k&list=PLmXU6Fis3FcxlQjZs30urrU2dVKVaCcQN&index=1&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 30,
                  _id: "689c351c10fac16c9c4a66ef",
                },
              ],
              restTime: 60,
              _id: "689c351c10fac16c9c4a66ee",
            },
            {
              exerciseId: {
                _id: "678380fb71f41f83a647236c",
                name: "פלאנק ",
                linkToVideo:
                  "https://www.youtube.com/watch?v=BjgY98I3Ths&list=PLmXU6Fis3FcxlQjZs30urrU2dVKVaCcQN&index=4&pp=gAQBiAQB",
              },
              sets: [
                {
                  minReps: 60,
                  _id: "689c351c10fac16c9c4a66f1",
                },
              ],
              restTime: 60,
              _id: "689c351c10fac16c9c4a66f0",
            },
          ],
          _id: "689c351c10fac16c9c4a66e2",
        },
      ],
      _id: "689c351b10fac16c9c4a66be",
    },
  ],
  __v: 1,
  cardio: {
    type: "simple",
    plan: {
      minsPerWeek: 60,
      timesPerWeek: 3,
      minsPerWorkout: 20,
    },
    _id: "689c351c10fac16c9c4a66f2",
  },
};
