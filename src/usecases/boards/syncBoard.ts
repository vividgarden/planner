import { UpsertBoard } from './upsertBoard';
import { BoardRepository } from '../../repositories/boardRepository';
import { OriginalBoardRepository } from '../../repositories/originalBoardRepository';

export class SyncBoard {
  private boardRepository: BoardRepository;
  private originalBoardRepository: OriginalBoardRepository;

  constructor(boardRepository: BoardRepository, originalBoardRepository: OriginalBoardRepository) {
    this.boardRepository = boardRepository;
    this.originalBoardRepository = originalBoardRepository;
  }

  async execute(): Promise<boolean> {
    const boards = await this.originalBoardRepository.findAll();
    const upsertBoard = new UpsertBoard(this.boardRepository);

    for(const b of boards.records) {
      await upsertBoard.execute(b);
    }

    return true;
  }
}