import * as nodeStreams from "stream";
import { Stream, StreamBase } from "./stream";

export class NodeStream extends StreamBase
{
    private _nodeStream: nodeStreams.Readable | nodeStreams.Writable;
    private _position: number = 0;
    private _isOpen: boolean = true;

    public get innerStream() 
    {
        return this._nodeStream;
    }

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
        const buf = readable.read(length) as Buffer;
        this._position += buf.byteLength;
        return buf;
    }

    public async write(data: Buffer): Promise<number>
    {
        if (!this.isOpen)
            throw new Error("This stream is not open.");
        if (!this.canWrite)
            throw new Error("This stream cannot be written to.");

        const writable = this._nodeStream as nodeStreams.Writable;
        await new Promise((resolve, reject) =>
            writable.write(data, (err) => err ? reject(err) : resolve()));

        return data.byteLength;
    }

    public async resize(length: number): Promise<boolean>
    {
        return false;
    }

    public async close(): Promise<void>
    {
        if (this._nodeStream instanceof nodeStreams.Writable)
            this._nodeStream.end();
        else
            this._nodeStream.destroy();

        super.close();
    }

    public substream(): Promise<Stream>
    {
        throw new Error("Method not implemented.");
    }
}