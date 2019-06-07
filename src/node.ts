import * as nodeStreams from "stream";
import { Stream, StreamBase } from "./stream";

export class NodeStream extends StreamBase
{
    private _nodeStream: nodeStreams.Readable | nodeStreams.Writable;
    private _position: number = 0;
    private _isOpen: boolean = true;

    public get position(): number
    {
        return this._position;
    }

    public get length(): number
    {
        if (this._nodeStream instanceof nodeStreams.Readable)
            return this.position + this._nodeStream.readableLength;
        else
            return this.position + this._nodeStream.writableLength;
    }

    public get canRead(): boolean
    {
        return this._nodeStream instanceof nodeStreams.Readable && this._nodeStream.readable;
    }

    public get canWrite(): boolean
    {
        return this._nodeStream instanceof nodeStreams.Writable && this._nodeStream.writable;
    }

    public get canSeek(): boolean { return false; }

    public get isOpen(): boolean
    {
        return this._isOpen;
    }

    public constructor(stream: nodeStreams.Readable | nodeStreams.Writable)
    {
        super();
        this._nodeStream = stream;
        this._nodeStream.on("close", () => this._isOpen = false);
    }

    public async seek(position: number): Promise<boolean>
    {
        return false;
    }

    public async read(length: number, exact?: boolean | undefined): Promise<Buffer>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");
        if (!this.canRead)
            throw new Error("This stream cannot be read from.");

        const readable = this._nodeStream as nodeStreams.Readable;
        return readable.read(length);
    }
    public readFrom(position: number, length: number, exact?: boolean | undefined): Promise<Buffer>
    {
        throw new Error("Method not implemented.");
    }
    public write(data: Buffer): Promise<number>
    {
        throw new Error("Method not implemented.");
    }
    public resize(length: number): Promise<boolean>
    {
        throw new Error("Method not implemented.");
    }
    public close(): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
    public substream(): Promise<Stream>
    {
        throw new Error("Method not implemented.");
    }
}