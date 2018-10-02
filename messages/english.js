const WARNINGS = {
    ATTEMPT_TO_SET_STATE_ON_DEAD_MACHINE: "attempt to set state on pending machine",
    ATTEMPT_TO_SET_STATE_ON_DEAD_MACHINE: "attempt to set state on dead machine",
    CANNOT_TRANSITION_TO_FALSY_STATE: "cannot transition to falsy states",
    STATE_MACHINE_DEAD: "state machine is dead",
    _ALREAYD_IN_STATE: (state) => `already in state "${state}".`,
    _TRANSITION_INTERRUPTED: (from, to, reason) => `transition from state "${from}" to state "${to}" interrupted: ${reason}.`,
    _TRANSITION_NOT_ALLOWED: (from, to) => `transition from state "${from}" to state "${to}" not allowed.`
}
const ERRORS = {
    MUST_DEFINE_DEFAULT_TRANSITIONS: "must define default transitions",
    MUST_DEFINE_DEFAULT_STATE: "must define default state",
    DEFAULT_STATE_MUST_BE_AT_TOP_OF_TRANSITION_TREE: "default state must be at top of transition tree",
    _TRANSITION_FAILED: (from, to, message) => `transition from state "${from}" to state "${to}" failed: ${message}.`
}
module.exports = {
    WARNINGS,
    ERRORS
};
