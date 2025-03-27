import { NoSqlRepository } from "@/libs/nosql-db/repositories/base/nosql-base.repositories";
import { SessionModel } from "@/libs/nosql-db/models/sessionModel";
import { Model } from "mongoose";
import { Session } from "@/libs/nosql-db/contracts/interfaces/session";

export class SessionRepository extends NoSqlRepository<Session> {
  private static instance: SessionRepository;
  private constructor(model: Model<Session>) {
    super(model);
  }

  public static getInstance(): SessionRepository {
    if (!SessionRepository.instance) {
      SessionRepository.instance = new SessionRepository(SessionModel);
    }
    return SessionRepository.instance;
  }
}
