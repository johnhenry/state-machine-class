const StateMachine = require("..");
const tape = require("tape");

tape("Normal Transitions", ({
    equal,
    end
}) => {
    const transitions = {
        "default": {
            "next": true,
            "last": true
        },
        "next": {
            "last": true
        }
    };
    const sm = new StateMachine(transitions, "default");
    equal(sm.state, "default", "Should have default state.");
    sm.state = "next";
    equal(sm.state, "next", "Should transition to next state.");
    sm.state = "default";
    equal(sm.state, "next", "Should not transition to states not in path.");
    sm.state = "bill the unknown state";
    equal(sm.state, "next", "Should not transition to unknown states.");
    sm.state = "";
    equal(sm.state, "next", "Should not transition to falsy states.");
    sm.state = "last";
    equal(sm.state, "last", "Should transition to next state.");
    end();
});

tape("Functional Transitions", ({
    equal,
    end
}) => {
    const transitions = {
        "default": {
            "previous": () => false
        },
        "previous": {
            "last": () => true,
        }
    };
    const sm = new StateMachine(transitions, "default");
    sm.state = "previous";
    equal(sm.state, "previous", "Should transition only if function returns falsy value.");
    sm.state = "last";
    equal(sm.state, "previous", "Should not transition function returns truthy value.");
    end();
});

tape("Death of a State Machine", ({
    equal,
    ok,
    notOk,
    end
}) => {
    const transitions = {
        "default": {
            "last": () => {
                throw new Error("cannot enter state");
            }

        }
    };
    const sm = new StateMachine(transitions, "default");
    equal(sm.dead, false, "Should not be dead after successful instantiation.");
    sm.state = "";
    equal(sm.state, "default", "Should not transition to a falsy state manually");
    sm.state = "last";
    ok(sm.dead, "Should be dead if an uncaught an error is thrown in a pre-transition function.");
    notOk(sm.state, "State should be falsy after dying.");
    end();
});

tape("Death of a State Machine: Part 2", ({
    equal,
    ok,
    notOk,
    end
}) => {
    const cleanup = function () {
        delete this.payload;
    }
    const transitions = {
        "default": {}
    };
    const sm = new StateMachine(transitions, "default", cleanup);
    sm.payload = "*";
    equal(sm.payload, "*", "Object should be mutable.");
    sm.die();
    ok(sm.dead, "Should not transition to a falsy state manually");
    notOk(sm.state, "Should be dead if an uncaught an error is thrown in a pre-transition function.");
    notOk(sm.payload, "Object should be cleaned up after dying");
    sm.state = "default";
    notOk(sm.state, "State should remain falsy after dying.");
    end();
});
