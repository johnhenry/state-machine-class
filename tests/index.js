const StateMachine = require("..");
const tape = require("tape");

tape("Normal Transitions", async ({
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
    try {
        sm.state = "default";
    } catch (error) {}
    equal(sm.state, "next", "Should throw error and retain state if state not in path");

    try {
        sm.state = "bill the unknown state";
    } catch (error) {}
    equal(sm.state, "next", "Should not transition to unknown states.");

    try {
        sm.state = "";
    } catch (error) {}
    equal(sm.state, "next", "Should not transition to falsy states.");

    sm.state = "last";
    equal(sm.state, "last", "Should transition to next state.");
    end();

});

tape("Functional Transitions", async ({
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
    await sm.setState("previous");
    equal(sm.state, "previous", "Should transition only if function returns falsy value.");
    await sm.setState("last");
    equal(sm.state, "previous", "Should not transition function returns truthy value.");
    end();
});

tape("Death of a State Machine", async ({
    equal,
    ok,
    notOk,
    end
}) => {
    const transitions = {
        "default": {}
    };
    const sm = new StateMachine(transitions, "default", undefined, true, undefined);
    equal(sm.dead, false, "Should not be dead after successful instantiation.");
    try {
        sm.state = "";
    } catch (error) {}
    ok(sm.dead, "Should be if dead is a transition error and \"dieOnError\" is truthy");
    notOk(sm.state, "State should be falsy after dying.");
    end();
});



tape("Life of a State Machine", async ({
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


    const sm = new StateMachine(transitions, "default", undefined, undefined, undefined);
    equal(sm.dead, false, "Should not be dead after successful instantiation.");
    try {
        sm.state = "";
    } catch (error) {}
    equal(sm.state, "default", "Should not transition to a falsy state manually");
    sm.state = "last";
    notOk(sm.dead, "Should not be dead if an uncaught an error is thrown in a pre-transition function.");
    ok(sm.state, "State should be falsy after dying.");
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
    notOk(sm.state, "State should remain falsy after dying.");
    end();
});
