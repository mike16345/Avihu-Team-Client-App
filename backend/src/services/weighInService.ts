import { WeighIns } from "../models/weighInModel";

export class WeighInService {
  async addWeighIn(data: any) {
    try {
      const { userId, date, weight } = data;
      const weighInsDoc = await WeighIns.findOneAndUpdate(
        { userId },
        { $push: { weighIns: { date, weight } } },
        { new: true, upsert: true }
      );
      return weighInsDoc;
    } catch (err) {
      return err;
    }
  }
}
export const weighInServices = new WeighInService();
