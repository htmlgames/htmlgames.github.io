// The "Game" represents the game-state: 4 different games are
// currently supported

function Player(name, cue) {
    this.name = name;
    this.ball_color = false;
    this.cue_color = cue;
}

function Game() {}
function Game_ctor( game, name, table ) {
    game.name = name;
    game.table = table;

    game.players = new Array();
    game.players.push( new Player( "Player 1", gold ) );
    game.players.push( new Player( "Player 2", purple ) );
    game.current_player = 0;
}

Game.prototype.create_ball = function ( x,y, color, name ) {
    var radius = ball_scale;
    var ysep = (1 + rack_ball_spacing) * radius * 1;
    var xsep = (1 + rack_ball_spacing) * radius * Math.sqrt(3);
    var table = this.table;

    var Dx = x*xsep + radius * rack_ball_spacing * (Math.random() - 0.5);
    var Dy = y*ysep + radius * rack_ball_spacing * (Math.random() - 0.5);

    var ball = new Ball( -.5 - Dx, Dy, radius, color, name );
    table.balls.push( ball );
    return ball;
}


Game.prototype.begin_shot = function ( shot ) {
    var player = this.players[ this.current_player ];
    if (this.table.is_stable()) {
        shot.cue_color = player.cue_color;
    }
    else {
        shot.cue_color = gray;
    }
    this.current_shot = shot;
}

Game.prototype.ball_struck = function () {
    this.first_collision = null;
    this.cushion_since_first_collision = false;
    this.potted_balls = new Array();
    this.off_table_balls = new Array();
    this.potted_cue_ball = false;
    this.required_first_contact = false;
}

Game.prototype.collision = function ( ball1, ball2 ) {
    if (!this.first_collision) {
        var cue_ball = this.table.cue_ball;
        if (ball1 == cue_ball) {
            this.first_collision = ball2;
        }
        else if (ball2 == cue_ball) {
            this.first_collision = ball1;
        }
    }
}

Game.prototype.cushion = function ( ball, cushion ) {
    if (this.first_collision) {
        this.cushion_since_first_collision = true;
    }
}

Game.prototype.potted = function ( ball ) {
    var cue_ball = this.table.cue_ball;
    if ( ball == cue_ball) {
        this.potted_cue_ball = true;
    }
    else {
        this.potted_balls.push( ball );
        this.cushion_since_first_collision = true;
    }
}

Game.prototype.replace_balls = function ( balls ) {
    for (i in balls) {
        this.table.replace_ball( balls[i] );
    }
}

Game.prototype.replace_off_table_balls = function () {
    this.replace_balls( this.off_table_balls );
}

Game.prototype.replace_potted_balls = function () {
    this.replace_balls( this.potted_balls );
}

Game.prototype.first_contact_ok = function (ball) {
    var req = this.required_first_contact;
    return !req || req==ball.name;
}

Game.prototype.get_shot_error = function () {

    var table = this.table;
    var error = "";

    if (this.potted_cue_ball) {
        error = "You potted the cue ball";
        var cue_ball = table.cue_ball;
        table.balls.push( cue_ball );
    }
    else if (!this.first_collision) {
        error = "You didn't hit any balls";
    }
    else if (!this.first_contact_ok( this.first_collision )) {
        error = "The first ball you made contact with was a "
            + this.first_collision.name
            + " ball, it should have been "
            + this.required_first_contact;
    }
    else if (!this.cushion_since_first_collision) {
        error = "You didn't hit a cushion after hitting the object ball";
    }

    return error;
}

Game.prototype.shot_complete = function () {

    var error = this.get_shot_error();
    var table = this.table;

    if (error) {
        this.replace_potted_balls();
        table.ball_in_hand = 1;
        alert( error + ": your opponent has ball in hand" );
    }

    if(bTouch)table.ball_in_hand = 1;
    this.replace_off_table_balls();

}

function Game_1ball( table ) { Game_ctor( this, "Practice", table ); }
function Game_0ball( table ) { Game_ctor( this, "Empty Table", table ); }
function Game_8ball( table ) { Game_ctor( this, "8 Ball", table ); }
function Game_9ball( table ) { Game_ctor( this, "9 Ball", table ); }

Game_9ball.prototype = new Game();
Game_8ball.prototype = new Game();
Game_1ball.prototype = new Game();
Game_0ball.prototype = new Game();

Game_8ball.prototype.create_balls = function ( radius ) {
    this.create_ball( 0,  0, red, "red" );

    this.create_ball( 1,  1, yellow, "yellow" );
    this.create_ball( 1, -1, red, "red" );

    this.create_ball( 2,  2, red, "red" );
    this.create_ball( 2,  0, black, "eight" );
    this.create_ball( 2, -2, yellow, "yellow" );

    this.create_ball( 3,  3, yellow, "yellow" );
    this.create_ball( 3,  1, red, "red" );
    this.create_ball( 3, -1, yellow, "yellow" );
    this.create_ball( 3, -3, red, "red" );

    this.create_ball( 4,  4, red, "red" );
    this.create_ball( 4,  2, yellow, "yellow" );
    this.create_ball( 4,  0, yellow, "yellow" );
    this.create_ball( 4, -2, red, "red" );
    this.create_ball( 4, -4, yellow, "yellow" );
}

Game_1ball.prototype.create_balls = function ( radius ) {
    this.create_ball( 0, 0, yellow, "object" );
}

Game_9ball.prototype.create_balls = function ( radius ) {

    var balls = new Array();
    balls.length = 10;

    balls[1] = this.create_ball( 0,  0, yellow, 1 );

    balls[2] = this.create_ball( 1, -1, blue, 2 );
    balls[3] = this.create_ball( 1,  1, red, 3 );

    balls[4] = this.create_ball( 2, -2, purple, 4 );
    balls[9] = this.create_ball( 2,  0, gold, 9 );
    balls[5] = this.create_ball( 2,  2, orange, 5 );

    balls[6] = this.create_ball( 3, -1, darkgreen, 6 );
    balls[7] = this.create_ball( 3,  1, brown, 7 );

    balls[8] = this.create_ball( 4,  0, black, 8 );

    this.ordered_balls = balls;
}

Game_0ball.prototype.create_balls = function ( radius ) {}

Game_0ball.prototype.shot_complete = function () {
    var table = this.table;
    if (this.potted_cue_ball) {
        var cue_ball = table.cue_ball;
        table.balls.push( cue_ball );
        table.ball_in_hand = 1;
    }
}

Game_9ball.prototype.next_ball_to_pot = function () {
    var i;
    for (i=1; i<=10; ++i) {
        var ball = this.ordered_balls[i];
        if (ball) return ball.name;
    }
    return false;
}

Game_9ball.prototype.super_ball_struck = Game.prototype.ball_struck;
Game_9ball.prototype.ball_struck = function () {
    this.super_ball_struck();
    this.required_first_contact = this.next_ball_to_pot();
    var player = this.players[ this.current_player ];
    status_message( player.name, "playing " + this.required_first_contact + " ball" );
}

Game_9ball.prototype.super_replace_potted_balls = Game_9ball.prototype.replace_potted_balls;
Game_9ball.prototype.replace_potted_balls = function () {
    for (i in this.potted_balls) {
        var ball = this.potted_balls[i];
        this.ordered_balls[ball.name] = ball;
    }
    this.super_replace_potted_balls();
}

Game_9ball.prototype.shot_complete = function () {

    for (i in this.potted_balls) {
        var ball = this.potted_balls[i];
        this.ordered_balls[ball.name] = null;
    }

    var error = this.get_shot_error();
    var table = this.table;
    var potted_9ball = false;

    var players = this.players;

    for (i in this.potted_balls) {
        var ball = this.potted_balls[i];
        if (ball.name == 9) potted_9ball = ball;
    }

    this.replace_off_table_balls();

    if (error) {
        if (potted_9ball) this.replace_potted_balls();
        table.ball_in_hand = 1;
        alert( error + ": your opponent has ball in hand" );
        this.current_player = 1 - this.current_player;
    }
    else if (potted_9ball) {
        alert( "CONGRATULATIONS, you win: you potted the 9-ball" );
        players = null;
        table.initialize( "9 Ball" );
    }
    else if (this.potted_balls.length == 0) {
        this.current_player = 1 - this.current_player;
    }

    if (players) {
        var current_player = players[ this.current_player ];
        var next_ball = this.next_ball_to_pot();
        status_message( current_player.name, "to shoot " + next_ball + " ball" );
    }
}


Game_8ball.prototype.super_ball_struck = Game.prototype.ball_struck;
Game_8ball.prototype.ball_struck = function () {
    this.super_ball_struck();
    var player = this.players[ this.current_player ];

    if (player.ball_color) {
        var table = this.table;
        for (i in table.balls) {
            var ball = table.balls[i];
            if (ball.name == player.ball_color) {
                this.required_first_contact = player.ball_color;
                status_message( "Ball Struck", player.name + " (" + player.ball_color + ")" );
                return;
            }
        }
        status_message( player.name, "For Victory" );
        this.required_first_contact = "eight";
    }
    else {
        status_message( player.name, " hoping to choose ball color" );
    }
}

Game_8ball.prototype.shot_complete = function () {

    var error = this.get_shot_error();
    var table = this.table;
    var potted_8ball = false;
    var red_count = 0;
    var yellow_count = 0;

    var players = this.players;
    var current_player = players[ this.current_player ];
    var other_player = players[ 1 - this.current_player ];

    for (i in this.potted_balls) {
        var ball = this.potted_balls[i];
        if (ball.name == "eight") potted_8ball = ball;
        else if (ball.name == "red") red_count++;
        else if (ball.name == "yellow") yellow_count++;
    }

    this.replace_off_table_balls();

    if (error) {
        if (potted_8ball) {
            alert( "YOU LOSE: " + error + ", and you potted the eight ball" );
            players = null;
            table.initialize( "8 Ball" );
        }
        else {
            //this.replace_potted_balls();
            table.ball_in_hand = 1;
            alert( error + ": " + other_player.name + " has ball in hand" );
            this.current_player = 1 - this.current_player;
        }
    }
    else if (potted_8ball) {
        if (!this.required_first_contact || this.required_first_contact == "eight") {
            alert( "CONGRATULATIONS, you win: you potted the eight-ball" );
        }
        else {
            alert( "YOU LOSE: you potted the eight ball when required to pot "
                    + this.required_first_contact);
        }
        players = null;
        table.initialize( "8 Ball" );
    }
    else if (red_count && ! yellow_count) {
        current_player.ball_color = "red";
        other_player.ball_color = "yellow";
    }
    else if (yellow_count && ! red_count) {
        current_player.ball_color = "yellow";
        other_player.ball_color = "red";
    }
    else if (! current_player.ball_color
            || (current_player.ball_color == "red" && !red_count)
            || (current_player.ball_color == "yellow" && !yellow_count)
            ) {
        this.current_player = 1 - this.current_player;
    }

    if (players) {
        var player = players[ this.current_player ];
        var message = player.name + " ";
        if (player.ball_color) {
            message += "(" + player.ball_color + ")";
        }
        else {
            message += "(open table)";
        }
        if (table.shot) {
            table.shot.cue_color = player.cue_color;
        }

        status_message( "To Shoot", message);
    }

}


Game_1ball.prototype.shot_complete = function () {
    var table = this.table;
    if (this.potted_cue_ball) {
        var cue_ball = table.cue_ball;
        table.balls.push( cue_ball );
        table.ball_in_hand = 1;
    }
    this.replace_potted_balls();
    this.replace_off_table_balls();
}
