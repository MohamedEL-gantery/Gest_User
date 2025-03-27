import { NoteService } from "@/libs/app/note/services/note.service";
import { Types } from "mongoose";

export class NoteAppController {
  static instance: NoteAppController;
  private readonly noteService;

  public static getInstance(): NoteAppController {
    if (!NoteAppController.instance) {
      NoteAppController.instance = new NoteAppController();
    }
    return NoteAppController.instance;
  }

  private constructor() {
    this.noteService = NoteService.getInstance();
  }

  public async create(
    title: string,
    description: string,
    userId: Types.ObjectId
  ) {
    return await this.noteService.createNote({ title, description, userId });
  }

  public async getAll(userId: Types.ObjectId, page?: number, limit?: number) {
    return await this.noteService.getNotes(userId, page, limit);
  }

  public async getOne(userId: Types.ObjectId, noteId: Types.ObjectId) {
    return await this.noteService.getOneNote(userId, noteId);
  }

  public async delete(userId: Types.ObjectId, noteId: Types.ObjectId) {
    return await this.noteService.deleteNote(userId, noteId);
  }

  public async update(
    userId: Types.ObjectId,
    noteId: Types.ObjectId,
    title?: string,
    description?: string
  ) {
    return await this.noteService.updateNote(userId, noteId, {
      title,
      description,
    });
  }
}
