const EventEmitter = require("event-emitter-class");
const {
    WARNINGS,
    ERRORS
} = require("./messages/english.js");
//INTERNAL_STATES use to simulate private variables
const INTERNAL_STATES = new Map();
const StateMachine = class extends EventEmitter {
    constructor(transitions = {}, defaultState = undefined, cleanup = undefined, events = undefined) {
        super(events);
        if (typeof transitions !== "object") {
            throw new Error(ERRORS.MUST_DEFINE_DEFAULT_TRANSITIONS);
        }
        if (!defaultState) {
            throw new Error(ERRORS.MUST_DEFINE_DEFAULT_STATE);
        }
        if (!transitions[defaultState]) {
            throw new Error(ERRORS.DEFAULT_STATE_MUST_BE_AT_TOP_OF_TRANSITION_TREE);
        }
        INTERNAL_STATES.set(this, defaultState);
        this._transitions = transitions;
        if (typeof cleanup === "function") {
            this._cleanup = cleanup.bind(this);
        }
        this.on(StateMachine.ERROR, this.die.bind(this));
    }
    setState(to) {
        if (this.dead) {
            this.emit(
                StateMachine.WARNING,
                WARNINGS.ATTEMPT_TO_SET_STATE_ON_DEAD_MACHINE
            );
            return this;
        }
        if (!to) {
            this.emit(
                StateMachine.WARNING,
                WARNINGS.CANNOT_TRANSITION_TO_FALSY_STATE
            );
        }
        const currentState = this.state;

        if (currentState === to) {
            this.emit(
                StateMachine.WARNING,
                WARNINGS.__ALREAYD_IN_STATE(currentState)
            );
            return this;
        }
        if (
            !this._transitions[currentState] ||
            !this._transitions[currentState][to]
        ) {
            this.emit(
                StateMachine.WARNING,
                WARNINGS._TRANSITION_NOT_ALLOWED(currentState, to)
            );
            return this;
        }
        const transitionFunction = this._transitions[currentState][to];
        if (typeof transitionFunction === "function") {
            try {
                const reason = transitionFunction.call(this, currentState, to);
                if (reason) {
                    this.emit(
                        StateMachine.WARNING,
                        WARNINGS._TRANSITION_INTERRUPTED(currentState, to, reason)
                    );
                    return this;
                }
            } catch (error) {
                this.emit(
                    StateMachine.ERROR,
                    ERRORS._TRANSITION_FAILED(currentState, to, error.message)
                );
                return this;
            }
        }
        INTERNAL_STATES.set(this, to);
        this.emit(StateMachine.STATECHANGED, currentState, to);
        return this;
    }
    getState() {
        const currentState = INTERNAL_STATES.get(this);
        if (!currentState) {
            this.emit(StateMachine.WARNING, WARNINGS.STATE_MACHINE_DEAD);
        }
        return currentState;
    }
    get state() {
        return this.getState();
    }
    set state(to) {
        this.setState(to);
    }
    get dead() {
        return !INTERNAL_STATES.get(this);
    }
    die(reason) {
        this.emit(StateMachine.DYING, reason);
        let cleanupResult;
        if (typeof this._cleanup === "function") {
            cleanupResult = this._cleanup(this);
        }
        INTERNAL_STATES.delete(this);
        this.emit(StateMachine.DEAD, cleanupResult);
        return this;
    }
};
StateMachine.STATECHANGED = "StateMachine.STATECHANGED";
StateMachine.WARNING = "StateMachine.WARNING";
StateMachine.ERROR = "StateMachine.ERROR";
StateMachine.DYING = "StateMachine.DYING";
StateMachine.DEAD = "StateMachine.DEAD";
// export StateMachine;
module.exports = StateMachine;
