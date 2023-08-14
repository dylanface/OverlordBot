import { User } from "discord.js";
import { OverlordClient } from "../types/Overlord";
import clientPromise from "../database";

export class VerificationManager {
  client: OverlordClient;
  cache: Map<string, Verification> = new Map();

  constructor(client: OverlordClient) {
    this.client = client;
  }

  async checkUser(user: User) {
    const verification = await this.getVerification(user);
    if (!verification) return false;
    if (verification.verified) return true;
    return false;
  }

  async verifyUser(user: User) {
    let verification = await this.getVerification(user);
    if (!verification) {
      verification = await this.createVerification(user);
    }
    if (verification.verified) return;

    verification.verify();
  }

  async getVerification(user: User) {
    return new Promise<Verification | undefined>(async (resolve, reject) => {
      let verification: Verification | undefined;

      if (this.cache.has(user.id)) {
        verification = this.cache.get(user.id);
        if (!verification)
          return reject(
            "Conversation has the incorrect format in the cache and can not be returned."
          );
        return resolve(verification);
      }

      const jsonVerification = await (await clientPromise)
        .db("overlord")
        .collection("user_verification")
        .findOne({ userId: user.id });

      if (!jsonVerification) {
        return resolve(undefined);
      }

      verification = new Verification(this, user.id, {
        verified: jsonVerification.verified,
        verifiedAt: jsonVerification.verifiedAt,
      });

      this.cache.set(user.id, verification);
      return resolve(verification);
    });
  }

  async createVerification(user: User) {
    return new Promise<Verification>(async (resolve, reject) => {
      const verification = new Verification(this, user.id);
      this.cache.set(user.id, verification);
      return resolve(verification);
    });
  }

  async saveVerification(verification: Verification) {
    await (
      await clientPromise
    )
      .db("overlord")
      .collection("user_verification")
      .updateOne(
        { userId: verification.userId },
        {
          $set: {
            verified: verification.verified,
            verifiedAt: verification.verifiedAt,
          },
        },
        { upsert: true }
      );
  }
}

class Verification {
  #manager: VerificationManager;
  userId: string;
  verified: boolean;
  verifiedAt?: number;
  persistent: boolean = false;

  constructor(
    manager: VerificationManager,
    userId: string,
    persistedValues?: {
      verified?: boolean;
      verifiedAt?: number;
    }
  ) {
    this.#manager = manager;
    this.userId = userId;
    this.verified = false;

    if (persistedValues) {
      this.verified = persistedValues?.verified ?? false;
      this.verifiedAt = persistedValues?.verifiedAt ?? undefined;
      this.persistent = true;
    }

    if (!this.persistent) this.save();
  }

  verify() {
    if (this.verified) return;

    this.verified = true;
    this.verifiedAt = Date.now();
    this.save();
  }

  async save() {
    await this.#manager.saveVerification(this);
  }
}
