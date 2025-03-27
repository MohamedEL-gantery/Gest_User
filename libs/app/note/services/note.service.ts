import { NoteRepository } from "@/libs/nosql-db/repositories/domain/note";
import { connectToDatabase } from "@/libs/utils/connectDatabase";
import { BadRequestAppException } from "@/libs/http";
import {
  CreateNoteRequestDto,
  UpdateNoteRequestDto,
} from "@/libs/app/note/dto";
import { Types } from "mongoose";

await connectToDatabase();

export class NoteService {
  static instance: NoteService;
  private readonly noteRepository: NoteRepository;

  private constructor() {
    this.noteRepository = NoteRepository.getInstance();
  }

  static getInstance(): NoteService {
    if (!NoteService.instance) {
      NoteService.instance = new NoteService();
    }
    return NoteService.instance;
  }

  public async createNote(createNoteRequestDto: CreateNoteRequestDto) {
    try {
      const newNote = await this.noteRepository.createOne(createNoteRequestDto);
      return newNote;
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async getNotes(userId: Types.ObjectId, page?: number, limit?: number) {
    try {
      const notes = await this.noteRepository.getAllWithPagination(
        { userId },
        [],
        page,
        limit
      );
      return notes;
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async getOneNote(userId: Types.ObjectId, noteId: Types.ObjectId) {
    try {
      return await this.checkPermissions(userId, noteId);
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async deleteNote(userId: Types.ObjectId, noteId: Types.ObjectId) {
    try {
      await this.checkPermissions(userId, noteId);
      await this.noteRepository.deleteOne({ _id: noteId });
      return { message: "Note deleted successfully" };
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  public async updateNote(
    userId: Types.ObjectId,
    noteId: Types.ObjectId,
    updateNoteRequestDto: UpdateNoteRequestDto
  ) {
    try {
      await this.checkPermissions(userId, noteId);
      return await this.noteRepository.updateOne(
        { _id: noteId },
        updateNoteRequestDto
      );
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }

  private async checkPermissions(
    userId: Types.ObjectId,
    noteId: Types.ObjectId
  ) {
    try {
      const note = await this.noteRepository.getOneOrThrowException(
        { _id: noteId },
        [],
        "Note not found"
      );

      const check = (note.userId._id as Types.ObjectId).equals(userId);

      if (!check) {
        throw new BadRequestAppException(
          "You don't have permission to access this note",
          403
        );
      }

      return note;
    } catch (error) {
      throw new BadRequestAppException(
        error instanceof Error ? error.message : " something went wrong",
        500
      );
    }
  }
}
