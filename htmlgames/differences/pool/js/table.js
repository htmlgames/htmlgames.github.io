// A table is where the action occurs


function Table () {
    this.update_id = null;
    this.shot = null;
};


Table.prototype.initialize = function ( game ) {
    this.balls = new Array();
    this.pockets = new Array();
    this.cushions = new Array();

    this.pockets.push(new Pocket( -1, -.5, ball_scale*pocket_scale ));
    this.pockets.push(new Pocket( -1,  .5, ball_scale*pocket_scale ));
    this.pockets.push(new Pocket(  0, -.5, ball_scale*pocket_scale ));
    this.pockets.push(new Pocket(  0,  .5, ball_scale*pocket_scale ));
    this.pockets.push(new Pocket(  1, -.5, ball_scale*pocket_scale ));
    this.pockets.push(new Pocket(  1,  .5, ball_scale*pocket_scale ));

    this.cushions.push( new Cushion( -1, 0.5, Math.PI/2, ball_scale*pocket_scale ) );
    this.cushions.push( new Cushion( 0, 0.5, Math.PI/2, ball_scale*pocket_scale ) );
    this.cushions.push( new Cushion( 0, -0.5, -Math.PI/2, ball_scale*pocket_scale ) );
    this.cushions.push( new Cushion( 1, -0.5, -Math.PI/2, ball_scale*pocket_scale ) );
    this.cushions.push( new Cushion( 1, 0.5, Math.PI, ball_scale*pocket_scale ) );
    this.cushions.push( new Cushion( -1, -0.5, 0, ball_scale*pocket_scale ) );

    // cue ball
    this.cue_ball = new Ball( .5, 0, ball_scale, white, "cue" );
    this.balls.push( this.cue_ball );
    this.ball_in_hand = 1;

    status_message( "game", game );

    if (game == "9 Ball") {
        this.game = new Game_9ball( this );
    }
    else if (game == "8 Ball") {
        this.game = new Game_8ball( this );
    }
    else if (game == "1 Ball") {
        this.game = new Game_1ball( this );
    }
    else if (game == "0 Ball") {
        this.game = new Game_0ball( this );
    }
    else {
        alert( "unknown game: " + game );
    }

    this.game.create_balls( ball_scale );
}

Table.prototype.replace_ball = function ( ball ) {

    var x = -0.5;
    var direction = -1;
    var done = 0;
    count = 50;

    while (!done) {
        if (--count == 0) done = 1;
        if (direction == -1 && x < -1+ball.radius) {
            x = -0.5;
            direction = 1;
        }
        else if (direction == 1 && x > 1-ball.radius) {
            x = -0.5;
            // give up
            done = 1;
        }
        else {
            ball.position = new Vector( x, 0 );
            var other = ball.find_overlapping_ball( this.balls );
            if (other != null) {
                var Dy = other.position.y;
                var h = ball.radius + other.radius;
                var Dx = Math.sqrt( h*h - Dy*Dy ) + rack_ball_spacing;
                x = other.position.x + Dx * direction;
            }
            else {
                done = 1;
            }
        }
    }

    ball.position = new Vector( x, 0 );
    this.balls.push(ball);
}

Table.prototype.begin_shot = function ( point ) {

    if (!this.is_stable()) return;

    var cue_ball = this.cue_ball;
    var D = point.difference( cue_ball.position );
    if ( D.squared() > cue_ball.radius*cue_ball.radius ) return;

    this.shot = new Shot( this.game, cue_ball, point );
}

Table.prototype.adjust_shot = function ( point ) {
    if (this.shot) {
        this.shot.adjust( point );
    }
}

Table.prototype.commit_shot = function ( point ) {
    if (this.shot) {
        this.shot.commit( point );
        this.shot = null;
        this.do_action();
    }
}

Table.prototype.draw = function () {
    var ctx = this.ctx;

    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.rect( -1.5, -1, 3, 2 );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = cyan;
    ctx.beginPath();
    ctx.rect( -1.2, -0.7, 2.4, 1.4 );
    ctx.closePath();
    ctx.fill();

    var outer = ball_scale * pocket_scale * Math.SQRT2;
    ctx.fillStyle = green;
    ctx.beginPath();
    ctx.rect( -1-outer, -0.5-outer, 2+2*outer, 1+2*outer );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = black;
    ctx.lineWidth = 0.005;
    ctx.beginPath();
    ctx.moveTo( 0.5, 0.5 );
    ctx.lineTo( 0.5, -0.5 );
    ctx.moveTo( 0.5, 0.25 );
    if(isIE){
    	ctx.arc( 0.612, 0, 0.25, Math.PI*-0.31, Math.PI*-0.31, true );
    }else{
    	ctx.arc( 0.5, 0, 0.25, Math.PI*0.5, Math.PI*-0.5, true );
    }
    ctx.closePath();
    ctx.stroke();

    for (pocket in this.pockets) {
        this.pockets[pocket].draw( ctx );
    }

    for (cushion in this.cushions) {
        this.cushions[cushion].draw( ctx );
    }

    var inner = outer / 2;
    ctx.fillStyle = brown;
    ctx.beginPath();
    ctx.moveTo( -1-inner, -0.5-inner );
    ctx.lineTo( -1-inner, +0.5+inner );
    ctx.lineTo( +1+inner, +0.5+inner );
    ctx.lineTo( +1+inner, -0.5-inner );
    ctx.moveTo( +1+outer, -0.5-outer );
    ctx.lineTo( +1+outer, +0.5+outer );
    ctx.lineTo( -1-outer, +0.5+outer );
    ctx.lineTo( -1-outer, -0.5-outer );
    ctx.lineTo( +1+outer, -0.5-outer );
    ctx.moveTo( +1+inner, -0.5-inner );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();


    for (ball in this.balls) {
        this.balls[ball].draw( ctx );
    }

    if (this.shot) {
        this.shot.draw( ctx );
    }
}

Table.prototype.update = function () {
    for (i in this.balls) {
        this.balls[i].begin_update();
    }

    for (i in this.balls) {
        var ball_i = this.balls[i];
        for (j in this.balls) {
            if (i != j) {
                var ball_j = this.balls[j];
                if (ball_i.do_collision( ball_j )) {
                    this.game.collision( ball_i, ball_j );
                }
            }
        }
    }

    for (i in this.balls) {
        var ball = this.balls[i];
        var cushion = ball.do_cushion( this );
        if (cushion) {
            this.game.cushion( ball, cushion  );
        }
    }

    for (ball in this.balls) {
        this.balls[ball].do_friction();
    }

    for (ball in this.balls) {
        this.balls[ball].end_update(this);
    }

    var potted = new Array();
    for (i in this.balls) {
        var ball = this.balls[i];
        if (ball.is_potted( this.pockets )) {
            potted.push(i);
        }
    }

    while (potted.length) {
        var i = potted.shift();
        var ball = this.balls[i];
        ball.velocity.zero();
        ball.spin.zero();
        this.game.potted( ball );
        this.balls[i] = this.balls[0];
        this.balls.shift();
    }
}

Table.prototype.is_stable = function () {
    for (i in this.balls) {
        var ball = this.balls[i];
        if (!ball.is_stable()) return false;
    }
    return true;
}

Table.prototype.do_action = function () {

    var table = this;

    function update_fn() {
        table.update();
    }

    if (table.update_id == null) {
        table.update_id = setInterval( update_fn, 10 );
    }

}
