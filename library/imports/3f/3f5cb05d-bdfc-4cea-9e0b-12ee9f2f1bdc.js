"use strict";
cc._RF.push(module, '3f5cbBdvfxM6p4LEu6fLxvc', 'Charpati');
// Script/Charpati.js

"use strict";

var GameState = {
    Idle: 1,
    Touching: 2,
    Moving: 3,
    End: 4
};

cc.Class({
    extends: cc.Component,

    properties: {
        plate: {
            default: null,
            type: cc.Sprite
        },
        tipLb: {
            default: null,
            type: cc.Label
        },
        flyDistance: 200,
        resistance: 100
    },

    // use this for initialization
    onLoad: function onLoad() {
        cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;
        this.registerTouch();
        this.startPos = this.node.position;
        this.worldStartPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        this.curState = GameState.Idle;
        this.tipLb.string = "Start";
    },

    // called every frame
    update: function update(dt) {
        var self = this;
        if (self.curState != GameState.Moving) return;
        var moveDistanceX = self.moveSpeedX * dt - self.resistanceX * dt * dt / 2;
        var moveDistanceY = self.moveSpeedY * dt - self.resistanceY * dt * dt / 2;
        self.moveSpeedX = self.moveSpeedX - self.resistanceX * dt;
        self.moveSpeedY = self.moveSpeedY - self.resistanceY * dt;
        if (moveDistanceY > 0) {
            var curPos = self.node.getPosition();
            self.node.setPosition(curPos.x + moveDistanceX, curPos.y + moveDistanceY);
        } else {
            self.curState = GameState.End;
            var platePos = self.plate.node.getPosition();
            var curPos = self.node.getPosition();
            var distance = (platePos.x - curPos.x) * (platePos.x - curPos.x) + (platePos.y - curPos.y) * (platePos.y - curPos.y);
            if (distance < 75 * 75) {
                cc.log("WIN");
                self.tipLb.string = "WIN";
                var newPosX = 100 + 440 * Math.random() - 320;
                var newPosY = 500 + 500 * Math.random() - 568;
                self.plate.node.setPosition(newPosX, newPosY);
                this.retry();
            } else {
                cc.log("LOSE");
                self.tipLb.string = "LOSE";
            }
        }
    },

    retry: function retry() {
        this.curState = GameState.Idle;
        this.node.setPosition(this.startPos);
        this.tipLb.string = "Start";
    },

    registerTouch: function registerTouch() {
        var self = this;
        self.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (self.curState != GameState.Idle) return;
            var touches = event.getTouches();
            var touchLoc = touches[0].getLocation();
            var arPos = self.node.convertToNodeSpaceAR(touchLoc);
            var distance = arPos.x * arPos.x + arPos.y * arPos.y;
            cc.log("distance=" + distance);
            if (distance < 75 * 75) {
                self.touchStartPos = touchLoc;
                self.curState = GameState.Touching;
                return true;
            }
        }, self.node);
        self.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (self.curState != GameState.Touching) return;
            var touches = event.getTouches();
            var touchLoc = touches[0].getLocation();
            var distance = (touchLoc.x - self.worldStartPos.x) * (touchLoc.x - self.worldStartPos.x) + (touchLoc.y - self.worldStartPos.y) * (touchLoc.y - self.worldStartPos.y);
            var date = new Date();
            var curMilliseconds = date.getMilliseconds();
            var newPosX = touchLoc.x - self.touchStartPos.x + self.startPos.x;
            var newPosY = touchLoc.y - self.touchStartPos.y + self.startPos.y;
            if (distance < self.flyDistance * self.flyDistance) {
                self.node.setPosition(newPosX, newPosY);
                self.lastPosX = newPosX;
                self.lastPosY = newPosY;
                self.lastMilliseconds = curMilliseconds;
            } else {
                var moveTime = (curMilliseconds - self.lastMilliseconds) / 1000;
                self.moveDistanceX = newPosX - self.lastPosX;
                self.moveDistanceY = newPosY - self.lastPosY;
                self.moveSpeedX = self.moveDistanceX / moveTime / 5;
                self.moveSpeedY = self.moveDistanceY / moveTime / 5;
                self.resistanceX = self.resistance * self.moveSpeedX / self.moveSpeedY;
                self.resistanceY = self.resistance;
                self.curState = GameState.Moving;
                cc.log("self.moveDistanceX=" + self.moveDistanceX);
                cc.log("self.moveDistanceY=" + self.moveDistanceY);
                cc.log("self.curState = GameState.Moving");
            }
        }, self.node);
        self.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (self.curState != GameState.Touching) return;
            self.node.setPosition(self.startPos);
            self.curState = GameState.Idle;
        }, self.node);
    },

    onCollisionEnter: function onCollisionEnter(other) {
        cc.log("fire onCollisionEnter " + other.node.name);
    },

    onCollisionStay: function onCollisionStay(other) {
        // console.log('on collision stay');
    },

    onCollisionExit: function onCollisionExit() {}
});

cc._RF.pop();