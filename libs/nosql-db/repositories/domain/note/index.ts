import { NoSqlRepository } from "@/libs/nosql-db/repositories/base/nosql-base.repositories";
import { NoteModel } from "@/libs/nosql-db/models/noteModel";
import { Model } from "mongoose";
import { Note } from "@/libs/nosql-db/contracts/interfaces/note";

export class NoteRepository extends NoSqlRepository<Note> {
  private static instance: NoteRepository;

  private constructor(model: Model<Note>) {
    super(model);
  }

  public static getInstance(): NoteRepository {
    if (!NoteRepository.instance) {
      NoteRepository.instance = new NoteRepository(NoteModel);
    }
    return NoteRepository.instance;
  }
}
