import { WeighIns } from "../models/weighInModel";

export class WeighInService {
  async addWeighIn(data: any) {
    try {
      const { userId, date, weight } = data;
      console.log("data", data);
      const weighInsDoc = await WeighIns.findOneAndUpdate(
        { userId },
        { $push: { weighIns: { date, weight } } },
        { new: true, upsert: true }
      );

      console.log("weigh in doc", weighInsDoc);
      return weighInsDoc;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}
export const weighInServices = new WeighInService();
