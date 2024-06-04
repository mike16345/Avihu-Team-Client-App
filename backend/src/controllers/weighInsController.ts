import { Request, Response } from "express";
import { WeighInSchemaValidation } from "../models/weighInModel";
import { weighInServices } from "../services/weighInService";
import { ObjectId } from "mongodb";

class WeighInsController {
  addWeighIn = async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = {
      userId: id,
      weight: req.body.weight,
    };

    const { error, value } = WeighInSchemaValidation.validate(data);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      const weighIn = await weighInServices.addWeighIn(value);

      res.status(201).json(weighIn);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "An error occurred while adding the weigh-in." });
    }
  };
}

export const weighInsController = new WeighInsController();
