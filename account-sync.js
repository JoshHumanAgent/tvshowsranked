/* Server acknowledgement and account ownership, independent of the DOM and Firebase SDK. */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.AccountSync = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
    'use strict';
    function withTimeout(operation, timeoutMs = 15000) {
        let timer;
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('The server did not confirm the request.')), timeoutMs);
        });
        return Promise.race([operation, timeout]).finally(() => clearTimeout(timer));
    }
    class Coordinator {
        constructor({ read, write, apply, snapshot, status, cache, timeoutMs = 15000, delay = 500 }) {
            Object.assign(this, { read, write, apply, snapshot, status, cache, timeoutMs, delay });
            this.uid = null; this.generation = 0; this.revision = 0; this.ready = false; this.dirty = false;
            this.timer = null; this.saving = null;
        }
        async load(uid) {
            clearTimeout(this.timer);
            const generation = ++this.generation;
            this.uid = uid; this.ready = false; this.dirty = false; this.saving = null; this.revision = 0;
            if (!uid) return false;
            this.status('loading');
            try {
                const data = await withTimeout(this.read(uid), this.timeoutMs);
                if (generation !== this.generation) return false;
                this.apply(data || {}); // The model validates atomically before replacing any preferences.
                this.ready = true;
                this.cache?.(uid, this.snapshot(), {reason:'load'});
                this.status('ready');
                return true;
            } catch (error) {
                if (generation === this.generation) this.status('load-error', error);
                return false;
            }
        }
        changed() {
            if (!this.uid || !this.ready) return false;
            this.revision++; this.dirty = true;
            this.cache?.(this.uid, this.snapshot(), {reason:'change'});
            this.status('pending');
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.save(), this.delay);
            return true;
        }
        async save() {
            clearTimeout(this.timer);
            if (!this.uid || !this.ready) return false;
            if (this.saving) {
                const pending = this.saving;
                const completed = await pending;
                if (!completed) return false;
                return this.dirty ? this.save() : true;
            }
            const uid = this.uid, generation = this.generation, revision = this.revision;
            const data = this.snapshot();
            this.status('saving');
            const operation = (async () => {
                try {
                    await withTimeout(this.write(uid, data), this.timeoutMs);
                    if (generation !== this.generation) return false;
                    if (revision === this.revision) {
                        this.dirty = false; this.cache?.(uid, data, {reason:'saved'}); this.status('saved');
                    }
                    else this.status('pending');
                    return true;
                } catch (error) {
                    if (generation === this.generation) { this.dirty = true; this.status('save-error', error); }
                    return false;
                }
            })();
            this.saving = operation;
            const success = await operation;
            if (generation === this.generation) {
                this.saving = null;
                if (success && this.dirty) return this.save();
            }
            return success;
        }
        disconnect() { clearTimeout(this.timer); this.generation++; this.uid = null; this.ready = false; this.saving = null; this.dirty = false; }
    }
    return Object.freeze({ Coordinator, withTimeout });
});
