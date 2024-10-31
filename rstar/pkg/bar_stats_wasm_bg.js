let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let WASM_VECTOR_LEN = 0;

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
 * @param {(BarPartialPlayerData)[]} data
 * @param {number} eps
 * @param {number} min_pts
 * @param {number} _max_pts
 * @param {number} cluster_size_factor_threshold
 * @returns {DepthClusterizationResults}
 */
export function clusterize_with_limit(data, eps, min_pts, _max_pts, cluster_size_factor_threshold) {
    const ptr0 = passArrayJsValueToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.clusterize_with_limit(ptr0, len0, eps, min_pts, _max_pts, cluster_size_factor_threshold);
    return DepthClusterizationResults.__wrap(ret);
}

let cachedFloat64ArrayMemory0 = null;

function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
/**
 * @param {Float64Array} values
 * @param {number} length
 * @param {MovingAverageOptions} method
 * @returns {Float64Array}
 */
export function moving_average(values, length, method) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArrayF64ToWasm0(values, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.moving_average(retptr, ptr0, len0, length, method);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
        if (r3) {
            throw takeObject(r2);
        }
        var v2 = getArrayF64FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 8, 8);
        return v2;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

export const MovingAverageOptions = Object.freeze({ EMA:0,"0":"EMA",SMA:1,"1":"SMA",SMM:2,"2":"SMM",WSMA:3,"3":"WSMA",SSMA:4,"4":"SSMA", });

const BarPartialPlayerDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_barpartialplayerdata_free(ptr >>> 0, 1));

export class BarPartialPlayerData {

    static __unwrap(jsValue) {
        if (!(jsValue instanceof BarPartialPlayerData)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BarPartialPlayerDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_barpartialplayerdata_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get battle_index() {
        const ret = wasm.__wbg_get_barpartialplayerdata_battle_index(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set battle_index(arg0) {
        wasm.__wbg_set_barpartialplayerdata_battle_index(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get x() {
        const ret = wasm.__wbg_get_barpartialplayerdata_x(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set x(arg0) {
        wasm.__wbg_set_barpartialplayerdata_x(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get y() {
        const ret = wasm.__wbg_get_barpartialplayerdata_y(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set y(arg0) {
        wasm.__wbg_set_barpartialplayerdata_y(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} battle_index
     * @param {number} x
     * @param {number} y
     */
    constructor(battle_index, x, y) {
        const ret = wasm.barpartialplayerdata_new(battle_index, x, y);
        this.__wbg_ptr = ret >>> 0;
        BarPartialPlayerDataFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}

const DepthClusterizationResultsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_depthclusterizationresults_free(ptr >>> 0, 1));

export class DepthClusterizationResults {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DepthClusterizationResults.prototype);
        obj.__wbg_ptr = ptr;
        DepthClusterizationResultsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DepthClusterizationResultsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_depthclusterizationresults_free(ptr, 0);
    }
    /**
     * @returns {Uint32Array}
     */
    get labels() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_depthclusterizationresults_labels(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint32Array} arg0
     */
    set labels(arg0) {
        const ptr0 = passArray32ToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_depthclusterizationresults_labels(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {number}
     */
    get cluster_count() {
        const ret = wasm.__wbg_get_depthclusterizationresults_cluster_count(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set cluster_count(arg0) {
        wasm.__wbg_set_depthclusterizationresults_cluster_count(this.__wbg_ptr, arg0);
    }
}

const SpatialIndexFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_spatialindex_free(ptr >>> 0, 1));

export class SpatialIndex {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SpatialIndexFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_spatialindex_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.spatialindex_new();
        this.__wbg_ptr = ret >>> 0;
        SpatialIndexFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} id
     * @param {number} x
     * @param {number} y
     */
    add(id, x, y) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.spatialindex_add(retptr, this.__wbg_ptr, id, x, y);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} eps
     * @returns {Uint32Array}
     */
    range_query(x, y, eps) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.spatialindex_range_query(retptr, this.__wbg_ptr, x, y, eps);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

export function __wbg_barpartialplayerdata_unwrap(arg0) {
    const ret = BarPartialPlayerData.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

