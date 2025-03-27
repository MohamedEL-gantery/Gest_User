import { NoSqlRepository } from "@/libs/nosql-db/repositories/base/nosql-base.repositories";
import { SessionLogModel } from "@/libs/nosql-db/models/sessionLogModel";
import { Model } from "mongoose";
import { SessionLog } from "@/libs/nosql-db/contracts/interfaces/sessionLog";

export class SessionLogRepository extends NoSqlRepository<SessionLog> {
  private static instance: SessionLogRepository;

  private constructor(model: Model<SessionLog>) {
    super(model);
  }

  public static getInstance(): SessionLogRepository {
    if (!SessionLogRepository.instance) {
      SessionLogRepository.instance = new SessionLogRepository(SessionLogModel);
    }
    return SessionLogRepository.instance;
  }
}
