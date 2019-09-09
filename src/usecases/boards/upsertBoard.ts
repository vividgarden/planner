import { Board } from '../../entities/board';
import { BoardRepository } from '../../repositories/boardRepository';

export class UpsertBoard {
  private repository: BoardRepository;

  constructor(boardRepository: BoardRepository) {
    this.repository = boardRepository;
  }

  execute(board: Board): Promise<void> {
    return this.repository.create(board);
  }
}