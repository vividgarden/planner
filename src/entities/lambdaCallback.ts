import {LambdaResponse} from './LambdaResponse';

export type LambdaCallback = (err: Error|null, res: LambdaResponse) => void;