import * as nodeStreams from "stream";
import EventEmitter from "eventemitter3";
import { StrictEventEmitter } from "strict-event-emitter-types";

interface StreamEvents
{
    "close": void;
}

export interface Stream extends StrictEventEmitter<EventEmitter, StreamEvents>
{
    /**
     * The current position of the cursor in the stream.
     */
    position: number;

    /**
     * The length of the stream, in bytes.
     */
    length: number;

    /**
     * `true` if this stream can be written to.
     */
    canWrite: boolean;

    /**
     * `true` if this stream can be read from.
     */
    canRead: boolean;

    /**
     * `true` if this stream can be seeked within.
     */
    canSeek: boolean;

    /**
     * `true` if this stream is currently open.
     */
    isOpen: boolean;

    /**
     * Changes the position of the next read in the stream.
     * @param position The position to set the cursor to.
     * @returns `true` if the operation was successful, otherwise returns `false`.
     * If `false` is returned, then the `position` of this stream will not change.
     */
    seek(position: number): Promise<boolean>;

    /**
     * Reads some bytes from the stream.
     * @param length The maximum number of bytes to return.
     * @param exact If `true`, then this method will block until `length` bytes are available
     * or fail.
     */
    read(length: number, exact?: boolean): Promise<Buffer>;

    /**
     * Combines `seek` and `read`.
     * @param position The starting position to read from.
     * @param length The maximum number of bytes to return.
     * @param exact If `true`, then this method will block until `length` bytes are available
     * or fail.
     */
    readFrom(position: number, length: number, exact?: boolean): Promise<Buffer>;

    /**
     * Writes some data to the stream.
     * @param data A `Buffer` containing the data to write.
     * @returns The number of bytes written.
     */
    write(data: Buffer): Promise<number>;

    /**
     * Writes some data to the stream at a given position.
     * @param data A `Buffer` containing the data to write.
     * @returns The number of bytes written.
     */
    writeAt(position: number, data: Buffer): Promise<number>;

    /**
     * Resizes the source of this stream to a given number of bytes. Streams that 
     * cannot be written to cannot be resized.
     * @param length The new length of this stream.
     * @returns `true` if the operation was successful, otherwise `false`.
     */
    resize(length: number): Promise<boolean>;

    /**
     * Closes this stream. Once it is closed, any underlying resources (memory buffers,
     * file handles) will be freed and this `Stream` will no longer be usable.
     */
    close(): Promise<void>;

    /**
     * Creates an independent `Stream` that operates on the same source material as this stream.
     * This sub-stream will be read-only.
     * @param from If specified, the sub-stream will only operate on the data in the range [from, to].
     * @param to If specified, the sub-stream will only operate on the data in the range [from, to].
     */
    substream(): Promise<Stream>;
    substream(from: number, to: number): Promise<Stream>;

    /**
     * Converts this stream into a Node.js-style stream.
     */
    asNodeStream(): nodeStreams.Duplex;
}

export abstract class StreamBase
    extends (EventEmitter as { new(): StrictEventEmitter<EventEmitter, StreamEvents> })
    implements Stream
{
    public abstract position: number;
    public abstract length: number;
    public abstract canWrite: boolean;
    public abstract canRead: boolean;
    public abstract canSeek: boolean;
    public abstract isOpen: boolean;

    public abstract seek(position: number): Promise<boolean>;

    public abstract read(length: number, exact?: boolean): Promise<Buffer>;

    public async readFrom(position: number, length: number, exact?: boolean): Promise<Buffer>
    {
        if (!await this.seek(position))
            throw new Error(`Could not seek to position ${position}.`);

        return this.read(length, exact);
    }

    public abstract write(data: Buffer): Promise<number>;

    public async writeAt(position: number, data: Buffer): Promise<number>
    {
        if (!await this.seek(position))
            throw new Error(`Could not seek to position ${position}.`);

        return this.write(data);
    }

    public abstract resize(length: number): Promise<boolean>;

    public async close(): Promise<void>
    {
        this.emit("close");
    }

    public async substream(from?: number, to?: number): Promise<Stream>
    {
        return new Substream(this, from, to);
    }

    public asNodeStream(): nodeStreams.Duplex 
    {
        const self = this;
        return new nodeStreams.Duplex({
            read(size)
            {
                self.read(Math.min(size, self.length))
                    .then(
                        data =>
                        {
                            this.push(data);

                            if (self.position >= self.length)
                                this.push(null);
                        },
                        err => this.emit("error", err));
            },
            write(chunk, _, callback)
            {
                self.write(chunk)
                    .then(
                        // tslint:disable-next-line: no-unnecessary-callback-wrapper
                        () => callback(),
                        callback);
            },
            writev(chunks, callback)
            {
                let promise: Promise<any> | null = null;

                for (const { chunk } of chunks)
                    promise = promise ? promise.then(() => self.write(chunk)) : self.write(chunk);

                if (promise)
                    promise.then(
                        // tslint:disable-next-line: no-unnecessary-callback-wrapper
                        () => callback(),
                        callback
                    );
                else
                    callback();
            },
            destroy(_, callback)
            {
                self.close()
                    .then(() => callback(null), callback);
            }
        })
    }
}

class Substream extends StreamBase
{
    private _position: number = 0;
    private _range: [number | null, number | null];
    private _isOpen: boolean = true;
    private _source: Stream;

    public constructor(source: Stream, start?: number, end?: number)
    {
        super();
        this._source = source;
        this._isOpen = source.isOpen;
        this._range = [start || null, end || null];
        this._source.on("close", () => this.close());
    }

    public get position()
    {
        if (this._range[0] !== null)
            return this._position - this._range[0];
        else
            return this._position;
    }

    public get length()
    {
        const start = this._range[0] || 0;
        const end = this._range[1] || this._source.length;
        return end - start;
    }

    public get canWrite(): boolean { return this._source.canWrite; }

    public get canRead(): boolean { return this._source.canRead; }

    public get canSeek(): boolean { return this._source.canSeek; }

    public get isOpen(): boolean { return this._isOpen; }

    public async seek(position: number): Promise<boolean>
    {
        if (!this.canSeek) return false;

        this._position = position + (this._range[0] || 0);
        return true;
    }

    public async read(length: number, exact?: boolean | undefined): Promise<Buffer>
    {
        return this._source.readFrom(this._position, length, exact);
    }

    public write(data: Buffer): Promise<number>
    {
        return this._source.writeAt(this._position, data);
    }

    public async resize(length: number): Promise<boolean>
    {
        const end = (this._range[0] || 0) + length;
        if (end <= this._source.length)
        {
            this._range[1] = end;
            return true;
        }

        return false;
    }

    public async close(): Promise<void>
    {
        this._isOpen = false;
    }
}
