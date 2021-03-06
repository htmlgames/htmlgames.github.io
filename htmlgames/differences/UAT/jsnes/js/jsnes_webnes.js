// Based on Ben Frishman JSNES Code with additions from Paul (sound / joystick / touch / autoload rom) Pure JS!

var usingGamepad = false;
var usingTouch = false;

function checkGamepad(usingTouch) {
	if (!usingTouch) {
		var gp = navigator.getGamepads()[0];
		if (gp) {
			var axeLF = gp.axes[0];
			var axeUF = gp.axes[1];
			var but0 = gp.buttons[0];
			var but1 = gp.buttons[1];
			var start = gp.buttons[11];
			var select = gp.buttons[3];
		}
	}
	
	if(usingTouch == "left" || axeLF < -0.5) { 
		that.input.setKey(37, 65) // l_kd
		that.input.setKey(39, 64) // r_ku
	} else if(usingTouch == "right" || axeLF > 0.5) {
		that.input.setKey(39, 65) // r_kd
		that.input.setKey(37, 64) // l_ku
	} else {
		if(usingTouch == "left_cancel" || axeLF > -0.5) {
		  that.input.setKey(37, 64) // l_ku
		}
		if(usingTouch == "right_cancel" || axeLF < 0.5) {  
		  that.input.setKey(39, 64) // r_ku
		}
	}
	if(usingTouch == "up" || axeUF < -0.5) { 
		that.input.setKey(38, 65) // u_kd
		that.input.setKey(40, 64) // d_ku
	} else if(usingTouch == "down" || axeUF > 0.5) {
		that.input.setKey(40, 65) // d_kd
		that.input.setKey(38, 64) // u_ku
	} else {
		if(usingTouch == "up_cancel" || axeUF > -0.5) {
		  that.input.setKey(38, 64) // u_ku
		}
		if(usingTouch == "down_cancel" || axeUF < 0.5) {
		  that.input.setKey(40, 64) // d_ku
		}
	}
	if(usingTouch == "a" || but0&&but0.pressed) {
		that.input.setKey(90, 65) // z_kd
	} else {
		that.input.setKey(90, 64) // z_ku
	}
	if(usingTouch == "b" || but1&&but1.pressed) {
		that.input.setKey(88, 65) // x_kd
	} else {
		that.input.setKey(88, 64) // x_ku
	}
	if(usingTouch == "start" || start&&start.pressed) {
		that.input.setKey(13, 65) // start_kd
	} else {
		that.input.setKey(13, 64) // start_ku
	}
	if(usingTouch == "select" || select&&select.pressed) {
		that.input.setKey(17, 65) // select_kd
	} else {
		that.input.setKey(17, 64) // select_ku
	}
	//if (usingTouch) usingTouch = !1;
}

var JSNES = function(a) {
    if (this.opts = {
            ui: JSNES.DummyUI,
            preferredFrameRate: 60,
            fpsInterval: !1,
            showDisplay: !0,
            emulateSound: !0,
            sampleRate: 44100,
            CPU_FREQ_NTSC: 1789772.5,
            CPU_FREQ_PAL: 1773447.4
        }, "undefined" != typeof a) {
        var b;
        for (b in this.opts) "undefined" != typeof a[b] && (this.opts[b] = a[b])
    }
    this.frameTime = 1e3 / this.opts.preferredFrameRate, this.ui = new this.opts.ui(this), this.cpu = new JSNES.CPU(this), this.ppu = new JSNES.PPU(this), this.papu = new JSNES.PAPU(this), this.mmap = null, this.input = new JSNES.Input, this.ui.updateStatus("Ready to load a ROM."), that = this
};
JSNES.VERSION = "<%= version %>", JSNES.prototype = {
    isRunning: !1,
    fpsFrameCount: 0,
    romData: null,
    reset: function() {
        null !== this.mmap && this.mmap.reset(), this.cpu.reset(), this.ppu.reset(), this.papu.reset()
    },
    start: function() {
        var a = this;
        try{this.ui.updateStatus("Use Z,X and Cursor keys");}catch(e){return void 0}
        null !== this.rom && this.rom.valid ? this.isRunning || (this.isRunning = !0, this.frameInterval = setInterval(function() {
            a.frame()
        }, this.frameTime)) : this.ui.updateStatus("There is no ROM loaded, or it is invalid.")
        
        /*
        || (this.isRunning = !0, this.frameInterval = setInterval(function() {
            a.frame()
        }, this.frameTime), this.resetFps(), this.printFps(), this.fpsInterval = setInterval(function() {
            a.printFps()
        }, this.opts.fpsInterval)) : this.ui.updateStatus("There is no ROM loaded, or it is invalid.")
        */
    },
    frame: function() {
        this.ppu.startFrame();
        var a = 0,
            b = this.opts.emulateSound,
            c = this.cpu,
            d = this.ppu,
            e = this.papu;
        a: for (;;)
            for (0 === c.cyclesToHalt ? (a = c.emulate(), b && e.clockFrameCounter(a), a *= 3) : c.cyclesToHalt > 8 ? (a = 24, b && e.clockFrameCounter(8), c.cyclesToHalt -= 8) : (a = 3 * c.cyclesToHalt, b && e.clockFrameCounter(c.cyclesToHalt), c.cyclesToHalt = 0); a > 0; a--) {
                if (d.curX === d.spr0HitX && 1 === d.f_spVisibility && d.scanline - 21 === d.spr0HitY && d.setStatusFlag(d.STATUS_SPRITE0HIT, !0), d.requestEndFrame && (d.nmiCounter--, 0 === d.nmiCounter)) {
                    d.requestEndFrame = !1, d.startVBlank();
                    break a
                }
                d.curX++, 341 === d.curX && (d.curX = 0, d.endScanline())
            }
        this.fpsFrameCount++, this.lastFrameTime = +new Date
    },
    printFps: function() {
        var a = +new Date,
            b = "Running";
        this.lastFpsTime && (b += ": " + (this.fpsFrameCount / ((a - this.lastFpsTime) / 1e3)).toFixed(2) + " FPS"), this.ui.updateStatus(b), this.fpsFrameCount = 0, this.lastFpsTime = a
    },
    stop: function() {
        clearInterval(this.frameInterval), clearInterval(this.fpsInterval), this.isRunning = !1
    },
    reloadRom: function() {
        null !== this.romData && this.loadRom(this.romData)
    },
    loadRom: function(a) {
    	if (typeof this.ui == "undefined") {document.getElementById("msg").innerHTML="Local file access required for rom";return void 0}
        if (this.isRunning && this.stop(), this.ui.updateStatus("Loading ROM..."), this.rom = new JSNES.ROM(this), this.rom.load(a), this.rom.valid) {
            if (this.reset(), this.mmap = this.rom.createMapper(), !this.mmap) return;
            this.mmap.loadROM(), this.ppu.setMirroring(this.rom.getMirroringType()), this.romData = a, this.ui.updateStatus("Successfully loaded. Ready to be started.")
        } else this.ui.updateStatus("Invalid ROM!");
        return this.rom.valid
    },
    resetFps: function() {
        this.lastFpsTime = null, this.fpsFrameCount = 0
    },
    setFramerate: function(a) {
        this.opts.preferredFrameRate = a, this.frameTime = 1e3 / a, this.papu.setSampleRate(this.opts.sampleRate, !1)
    },
    toJSON: function() {
        return {
            romData: this.romData,
            cpu: this.cpu.toJSON(),
            mmap: this.mmap.toJSON(),
            ppu: this.ppu.toJSON()
        }
    },
    fromJSON: function(a) {
        this.loadRom(a.romData), this.cpu.fromJSON(a.cpu), this.mmap.fromJSON(a.mmap), this.ppu.fromJSON(a.ppu)
    }
}, JSNES.Utils = {
    copyArrayElements: function(a, b, c, d, e) {
        for (var f = 0; e > f; ++f) c[d + f] = a[b + f]
    },
    copyArray: function(a) {
        for (var b = new Array(a.length), c = 0; c < a.length; c++) b[c] = a[c];
        return b
    },
    fromJSON: function(a, b) {
        for (var c = 0; c < a.JSON_PROPERTIES.length; c++) a[a.JSON_PROPERTIES[c]] = b[a.JSON_PROPERTIES[c]]
    },
    toJSON: function(a) {
        for (var b = {}, c = 0; c < a.JSON_PROPERTIES.length; c++) b[a.JSON_PROPERTIES[c]] = a[a.JSON_PROPERTIES[c]];
        return b
    },
    isIE: function() {
        return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)
    }
}, JSNES.CPU = function(a) {
    this.nes = a, this.mem = null, this.REG_ACC = null, this.REG_X = null, this.REG_Y = null, this.REG_SP = null, this.REG_PC = null, this.REG_PC_NEW = null, this.REG_STATUS = null, this.F_CARRY = null, this.F_DECIMAL = null, this.F_INTERRUPT = null, this.F_INTERRUPT_NEW = null, this.F_OVERFLOW = null, this.F_SIGN = null, this.F_ZERO = null, this.F_NOTUSED = null, this.F_NOTUSED_NEW = null, this.F_BRK = null, this.F_BRK_NEW = null, this.opdata = null, this.cyclesToHalt = null, this.crash = null, this.irqRequested = null, this.irqType = null, this.reset()
}, JSNES.CPU.prototype = {
    IRQ_NORMAL: 0,
    IRQ_NMI: 1,
    IRQ_RESET: 2,
    reset: function() {
        this.mem = new Array(65536);
        for (var a = 0; 8192 > a; a++) this.mem[a] = 255;
        for (var b = 0; 4 > b; b++) {
            var a = 2048 * b;
            this.mem[a + 8] = 247, this.mem[a + 9] = 239, this.mem[a + 10] = 223, this.mem[a + 15] = 191
        }
        for (var a = 8193; a < this.mem.length; a++) this.mem[a] = 0;
        this.REG_ACC = 0, this.REG_X = 0, this.REG_Y = 0, this.REG_SP = 511, this.REG_PC = 32767, this.REG_PC_NEW = 32767, this.REG_STATUS = 40, this.setStatus(40), this.F_CARRY = 0, this.F_DECIMAL = 0, this.F_INTERRUPT = 1, this.F_INTERRUPT_NEW = 1, this.F_OVERFLOW = 0, this.F_SIGN = 0, this.F_ZERO = 1, this.F_NOTUSED = 1, this.F_NOTUSED_NEW = 1, this.F_BRK = 1, this.F_BRK_NEW = 1, this.opdata = (new JSNES.CPU.OpData).opdata, this.cyclesToHalt = 0, this.crash = !1, this.irqRequested = !1, this.irqType = null
    },
    emulate: function() {
        var a, b;
        if (this.irqRequested) {
            switch (a = this.F_CARRY | (0 === this.F_ZERO ? 1 : 0) << 1 | this.F_INTERRUPT << 2 | this.F_DECIMAL << 3 | this.F_BRK << 4 | this.F_NOTUSED << 5 | this.F_OVERFLOW << 6 | this.F_SIGN << 7, this.REG_PC_NEW = this.REG_PC, this.F_INTERRUPT_NEW = this.F_INTERRUPT, this.irqType) {
                case 0:
                    if (0 != this.F_INTERRUPT) break;
                    this.doIrq(a);
                    break;
                case 1:
                    this.doNonMaskableInterrupt(a);
                    break;
                case 2:
                    this.doResetInterrupt()
            }
            this.REG_PC = this.REG_PC_NEW, this.F_INTERRUPT = this.F_INTERRUPT_NEW, this.F_BRK = this.F_BRK_NEW, this.irqRequested = !1
        }
        var c = this.opdata[this.nes.mmap.load(this.REG_PC + 1)],
            d = c >> 24,
            e = 0,
            f = c >> 8 & 255,
            g = this.REG_PC;
        this.REG_PC += c >> 16 & 255;
        var h = 0;
        switch (f) {
            case 0:
                h = this.load(g + 2);
                break;
            case 1:
                h = this.load(g + 2), h += 128 > h ? this.REG_PC : this.REG_PC - 256;
                break;
            case 2:
                break;
            case 3:
                h = this.load16bit(g + 2);
                break;
            case 4:
                h = this.REG_ACC;
                break;
            case 5:
                h = this.REG_PC;
                break;
            case 6:
                h = this.load(g + 2) + this.REG_X & 255;
                break;
            case 7:
                h = this.load(g + 2) + this.REG_Y & 255;
                break;
            case 8:
                h = this.load16bit(g + 2), (65280 & h) != (h + this.REG_X & 65280) && (e = 1), h += this.REG_X;
                break;
            case 9:
                h = this.load16bit(g + 2), (65280 & h) != (h + this.REG_Y & 65280) && (e = 1), h += this.REG_Y;
                break;
            case 10:
                h = this.load(g + 2), (65280 & h) != (h + this.REG_X & 65280) && (e = 1), h += this.REG_X, h &= 255, h = this.load16bit(h);
                break;
            case 11:
                h = this.load16bit(this.load(g + 2)), (65280 & h) != (h + this.REG_Y & 65280) && (e = 1), h += this.REG_Y;
                break;
            case 12:
                h = this.load16bit(g + 2), h = 8191 > h ? this.mem[h] + (this.mem[65280 & h | (255 & h) + 1 & 255] << 8) : this.nes.mmap.load(h) + (this.nes.mmap.load(65280 & h | (255 & h) + 1 & 255) << 8)
        }
        switch (h &= 65535, 255 & c) {
            case 0:
                a = this.REG_ACC + this.load(h) + this.F_CARRY, this.F_OVERFLOW = 0 == (128 & (this.REG_ACC ^ this.load(h))) && 0 != (128 & (this.REG_ACC ^ a)) ? 1 : 0, this.F_CARRY = a > 255 ? 1 : 0, this.F_SIGN = a >> 7 & 1, this.F_ZERO = 255 & a, this.REG_ACC = 255 & a, d += e;
                break;
            case 1:
                this.REG_ACC = this.REG_ACC & this.load(h), this.F_SIGN = this.REG_ACC >> 7 & 1, this.F_ZERO = this.REG_ACC, 11 != f && (d += e);
                break;
            case 2:
                4 == f ? (this.F_CARRY = this.REG_ACC >> 7 & 1, this.REG_ACC = this.REG_ACC << 1 & 255, this.F_SIGN = this.REG_ACC >> 7 & 1, this.F_ZERO = this.REG_ACC) : (a = this.load(h), this.F_CARRY = a >> 7 & 1, a = a << 1 & 255, this.F_SIGN = a >> 7 & 1, this.F_ZERO = a, this.write(h, a));
                break;
            case 3:
                0 == this.F_CARRY && (d += (65280 & g) != (65280 & h) ? 2 : 1, this.REG_PC = h);
                break;
            case 4:
                1 == this.F_CARRY && (d += (65280 & g) != (65280 & h) ? 2 : 1, this.REG_PC = h);
                break;
            case 5:
                0 == this.F_ZERO && (d += (65280 & g) != (65280 & h) ? 2 : 1, this.REG_PC = h);
                break;
            case 6:
                a = this.load(h), this.F_SIGN = a >> 7 & 1, this.F_OVERFLOW = a >> 6 & 1, a &= this.REG_ACC, this.F_ZERO = a;
                break;
            case 7:
                1 == this.F_SIGN && (d++, this.REG_PC = h);
                break;
            case 8:
                0 != this.F_ZERO && (d += (65280 & g) != (65280 & h) ? 2 : 1, this.REG_PC = h);
                break;
            case 9:
                0 == this.F_SIGN && (d += (65280 & g) != (65280 & h) ? 2 : 1, this.REG_PC = h);
                break;
            case 10:
                this.REG_PC += 2, this.push(this.REG_PC >> 8 & 255), this.push(255 & this.REG_PC), this.F_BRK = 1, this.push(this.F_CARRY | (0 == this.F_ZERO ? 1 : 0) << 1 | this.F_INTERRUPT << 2 | this.F_DECIMAL << 3 | this.F_BRK << 4 | this.F_NOTUSED << 5 | this.F_OVERFLOW << 6 | this.F_SIGN << 7), this.F_INTERRUPT = 1, this.REG_PC = this.load16bit(65534), this.REG_PC--;
                break;
            case 11:
                0 == this.F_OVERFLOW && (d += (65280 & g) != (65280 & h) ? 2 : 1, this.REG_PC = h);
                break;
            case 12:
                1 == this.F_OVERFLOW && (d += (65280 & g) != (65280 & h) ? 2 : 1, this.REG_PC = h);
                break;
            case 13:
                this.F_CARRY = 0;
                break;
            case 14:
                this.F_DECIMAL = 0;
                break;
            case 15:
                this.F_INTERRUPT = 0;
                break;
            case 16:
                this.F_OVERFLOW = 0;
                break;
            case 17:
                a = this.REG_ACC - this.load(h), this.F_CARRY = a >= 0 ? 1 : 0, this.F_SIGN = a >> 7 & 1, this.F_ZERO = 255 & a, d += e;
                break;
            case 18:
                a = this.REG_X - this.load(h), this.F_CARRY = a >= 0 ? 1 : 0, this.F_SIGN = a >> 7 & 1, this.F_ZERO = 255 & a;
                break;
            case 19:
                a = this.REG_Y - this.load(h), this.F_CARRY = a >= 0 ? 1 : 0, this.F_SIGN = a >> 7 & 1, this.F_ZERO = 255 & a;
                break;
            case 20:
                a = this.load(h) - 1 & 255, this.F_SIGN = a >> 7 & 1, this.F_ZERO = a, this.write(h, a);
                break;
            case 21:
                this.REG_X = this.REG_X - 1 & 255, this.F_SIGN = this.REG_X >> 7 & 1, this.F_ZERO = this.REG_X;
                break;
            case 22:
                this.REG_Y = this.REG_Y - 1 & 255, this.F_SIGN = this.REG_Y >> 7 & 1, this.F_ZERO = this.REG_Y;
                break;
            case 23:
                this.REG_ACC = 255 & (this.load(h) ^ this.REG_ACC), this.F_SIGN = this.REG_ACC >> 7 & 1, this.F_ZERO = this.REG_ACC, d += e;
                break;
            case 24:
                a = this.load(h) + 1 & 255, this.F_SIGN = a >> 7 & 1, this.F_ZERO = a, this.write(h, 255 & a);
                break;
            case 25:
                this.REG_X = this.REG_X + 1 & 255, this.F_SIGN = this.REG_X >> 7 & 1, this.F_ZERO = this.REG_X;
                break;
            case 26:
                this.REG_Y++, this.REG_Y &= 255, this.F_SIGN = this.REG_Y >> 7 & 1, this.F_ZERO = this.REG_Y;
                break;
            case 27:
                this.REG_PC = h - 1;
                break;
            case 28:
                this.push(this.REG_PC >> 8 & 255), this.push(255 & this.REG_PC), this.REG_PC = h - 1;
                break;
            case 29:
                this.REG_ACC = this.load(h), this.F_SIGN = this.REG_ACC >> 7 & 1, this.F_ZERO = this.REG_ACC, d += e;
                break;
            case 30:
                this.REG_X = this.load(h), this.F_SIGN = this.REG_X >> 7 & 1, this.F_ZERO = this.REG_X, d += e;
                break;
            case 31:
                this.REG_Y = this.load(h), this.F_SIGN = this.REG_Y >> 7 & 1, this.F_ZERO = this.REG_Y, d += e;
                break;
            case 32:
                4 == f ? (a = 255 & this.REG_ACC, this.F_CARRY = 1 & a, a >>= 1, this.REG_ACC = a) : (a = 255 & this.load(h), this.F_CARRY = 1 & a, a >>= 1, this.write(h, a)), this.F_SIGN = 0, this.F_ZERO = a;
                break;
            case 33:
                break;
            case 34:
                a = 255 & (this.load(h) | this.REG_ACC), this.F_SIGN = a >> 7 & 1, this.F_ZERO = a, this.REG_ACC = a, 11 != f && (d += e);
                break;
            case 35:
                this.push(this.REG_ACC);
                break;
            case 36:
                this.F_BRK = 1, this.push(this.F_CARRY | (0 == this.F_ZERO ? 1 : 0) << 1 | this.F_INTERRUPT << 2 | this.F_DECIMAL << 3 | this.F_BRK << 4 | this.F_NOTUSED << 5 | this.F_OVERFLOW << 6 | this.F_SIGN << 7);
                break;
            case 37:
                this.REG_ACC = this.pull(), this.F_SIGN = this.REG_ACC >> 7 & 1, this.F_ZERO = this.REG_ACC;
                break;
            case 38:
                a = this.pull(), this.F_CARRY = 1 & a, this.F_ZERO = 1 == (a >> 1 & 1) ? 0 : 1, this.F_INTERRUPT = a >> 2 & 1, this.F_DECIMAL = a >> 3 & 1, this.F_BRK = a >> 4 & 1, this.F_NOTUSED = a >> 5 & 1, this.F_OVERFLOW = a >> 6 & 1, this.F_SIGN = a >> 7 & 1, this.F_NOTUSED = 1;
                break;
            case 39:
                4 == f ? (a = this.REG_ACC, b = this.F_CARRY, this.F_CARRY = a >> 7 & 1, a = (a << 1 & 255) + b, this.REG_ACC = a) : (a = this.load(h), b = this.F_CARRY, this.F_CARRY = a >> 7 & 1, a = (a << 1 & 255) + b, this.write(h, a)), this.F_SIGN = a >> 7 & 1, this.F_ZERO = a;
                break;
            case 40:
                4 == f ? (b = this.F_CARRY << 7, this.F_CARRY = 1 & this.REG_ACC, a = (this.REG_ACC >> 1) + b, this.REG_ACC = a) : (a = this.load(h), b = this.F_CARRY << 7, this.F_CARRY = 1 & a, a = (a >> 1) + b, this.write(h, a)), this.F_SIGN = a >> 7 & 1, this.F_ZERO = a;
                break;
            case 41:
                if (a = this.pull(), this.F_CARRY = 1 & a, this.F_ZERO = 0 == (a >> 1 & 1) ? 1 : 0, this.F_INTERRUPT = a >> 2 & 1, this.F_DECIMAL = a >> 3 & 1, this.F_BRK = a >> 4 & 1, this.F_NOTUSED = a >> 5 & 1, this.F_OVERFLOW = a >> 6 & 1, this.F_SIGN = a >> 7 & 1, this.REG_PC = this.pull(), this.REG_PC += this.pull() << 8, 65535 == this.REG_PC) return;
                this.REG_PC--, this.F_NOTUSED = 1;
                break;
            case 42:
                if (this.REG_PC = this.pull(), this.REG_PC += this.pull() << 8, 65535 == this.REG_PC) return;
                break;
            case 43:
                a = this.REG_ACC - this.load(h) - (1 - this.F_CARRY), this.F_SIGN = a >> 7 & 1, this.F_ZERO = 255 & a, this.F_OVERFLOW = 0 != (128 & (this.REG_ACC ^ a)) && 0 != (128 & (this.REG_ACC ^ this.load(h))) ? 1 : 0, this.F_CARRY = 0 > a ? 0 : 1, this.REG_ACC = 255 & a, 11 != f && (d += e);
                break;
            case 44:
                this.F_CARRY = 1;
                break;
            case 45:
                this.F_DECIMAL = 1;
                break;
            case 46:
                this.F_INTERRUPT = 1;
                break;
            case 47:
                this.write(h, this.REG_ACC);
                break;
            case 48:
                this.write(h, this.REG_X);
                break;
            case 49:
                this.write(h, this.REG_Y);
                break;
            case 50:
                this.REG_X = this.REG_ACC, this.F_SIGN = this.REG_ACC >> 7 & 1, this.F_ZERO = this.REG_ACC;
                break;
            case 51:
                this.REG_Y = this.REG_ACC, this.F_SIGN = this.REG_ACC >> 7 & 1, this.F_ZERO = this.REG_ACC;
                break;
            case 52:
                this.REG_X = this.REG_SP - 256, this.F_SIGN = this.REG_SP >> 7 & 1, this.F_ZERO = this.REG_X;
                break;
            case 53:
                this.REG_ACC = this.REG_X, this.F_SIGN = this.REG_X >> 7 & 1, this.F_ZERO = this.REG_X;
                break;
            case 54:
                this.REG_SP = this.REG_X + 256, this.stackWrap();
                break;
            case 55:
                this.REG_ACC = this.REG_Y, this.F_SIGN = this.REG_Y >> 7 & 1, this.F_ZERO = this.REG_Y;
                break;
            default:
                this.nes.stop(), this.nes.crashMessage = "Game crashed, invalid opcode at address $" + g.toString(16)
        }
        return d
    },
    load: function(a) {
        return 8192 > a ? this.mem[2047 & a] : this.nes.mmap.load(a)
    },
    load16bit: function(a) {
        return 8191 > a ? this.mem[2047 & a] | this.mem[a + 1 & 2047] << 8 : this.nes.mmap.load(a) | this.nes.mmap.load(a + 1) << 8
    },
    write: function(a, b) {
        8192 > a ? this.mem[2047 & a] = b : this.nes.mmap.write(a, b)
    },
    requestIrq: function(a) {
        this.irqRequested && a == this.IRQ_NORMAL || (this.irqRequested = !0, this.irqType = a)
    },
    push: function(a) {
        this.nes.mmap.write(this.REG_SP, a), this.REG_SP--, this.REG_SP = 256 | 255 & this.REG_SP
    },
    stackWrap: function() {
        this.REG_SP = 256 | 255 & this.REG_SP
    },
    pull: function() {
        return this.REG_SP++, this.REG_SP = 256 | 255 & this.REG_SP, this.nes.mmap.load(this.REG_SP)
    },
    pageCrossed: function(a, b) {
        return (65280 & a) != (65280 & b)
    },
    haltCycles: function(a) {
        this.cyclesToHalt += a
    },
    doNonMaskableInterrupt: function(a) {
        0 != (128 & this.nes.mmap.load(8192)) && (this.REG_PC_NEW++, this.push(this.REG_PC_NEW >> 8 & 255), this.push(255 & this.REG_PC_NEW), this.push(a), this.REG_PC_NEW = this.nes.mmap.load(65530) | this.nes.mmap.load(65531) << 8, this.REG_PC_NEW--)
    },
    doResetInterrupt: function() {
        this.REG_PC_NEW = this.nes.mmap.load(65532) | this.nes.mmap.load(65533) << 8, this.REG_PC_NEW--
    },
    doIrq: function(a) {
        this.REG_PC_NEW++, this.push(this.REG_PC_NEW >> 8 & 255), this.push(255 & this.REG_PC_NEW), this.push(a), this.F_INTERRUPT_NEW = 1, this.F_BRK_NEW = 0, this.REG_PC_NEW = this.nes.mmap.load(65534) | this.nes.mmap.load(65535) << 8, this.REG_PC_NEW--
    },
    getStatus: function() {
        return this.F_CARRY | this.F_ZERO << 1 | this.F_INTERRUPT << 2 | this.F_DECIMAL << 3 | this.F_BRK << 4 | this.F_NOTUSED << 5 | this.F_OVERFLOW << 6 | this.F_SIGN << 7
    },
    setStatus: function(a) {
        this.F_CARRY = 1 & a, this.F_ZERO = a >> 1 & 1, this.F_INTERRUPT = a >> 2 & 1, this.F_DECIMAL = a >> 3 & 1, this.F_BRK = a >> 4 & 1, this.F_NOTUSED = a >> 5 & 1, this.F_OVERFLOW = a >> 6 & 1, this.F_SIGN = a >> 7 & 1
    },
    JSON_PROPERTIES: ["mem", "cyclesToHalt", "irqRequested", "irqType", "REG_ACC", "REG_X", "REG_Y", "REG_SP", "REG_PC", "REG_PC_NEW", "REG_STATUS", "F_CARRY", "F_DECIMAL", "F_INTERRUPT", "F_INTERRUPT_NEW", "F_OVERFLOW", "F_SIGN", "F_ZERO", "F_NOTUSED", "F_NOTUSED_NEW", "F_BRK", "F_BRK_NEW"],
    toJSON: function() {
        return JSNES.Utils.toJSON(this)
    },
    fromJSON: function(a) {
        JSNES.Utils.fromJSON(this, a)
    }
}, JSNES.CPU.OpData = function() {
    this.opdata = new Array(256);
    for (var a = 0; 256 > a; a++) this.opdata[a] = 255;
    this.setOp(this.INS_ADC, 105, this.ADDR_IMM, 2, 2), this.setOp(this.INS_ADC, 101, this.ADDR_ZP, 2, 3), this.setOp(this.INS_ADC, 117, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_ADC, 109, this.ADDR_ABS, 3, 4), this.setOp(this.INS_ADC, 125, this.ADDR_ABSX, 3, 4), this.setOp(this.INS_ADC, 121, this.ADDR_ABSY, 3, 4), this.setOp(this.INS_ADC, 97, this.ADDR_PREIDXIND, 2, 6), this.setOp(this.INS_ADC, 113, this.ADDR_POSTIDXIND, 2, 5), this.setOp(this.INS_AND, 41, this.ADDR_IMM, 2, 2), this.setOp(this.INS_AND, 37, this.ADDR_ZP, 2, 3), this.setOp(this.INS_AND, 53, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_AND, 45, this.ADDR_ABS, 3, 4), this.setOp(this.INS_AND, 61, this.ADDR_ABSX, 3, 4), this.setOp(this.INS_AND, 57, this.ADDR_ABSY, 3, 4), this.setOp(this.INS_AND, 33, this.ADDR_PREIDXIND, 2, 6), this.setOp(this.INS_AND, 49, this.ADDR_POSTIDXIND, 2, 5), this.setOp(this.INS_ASL, 10, this.ADDR_ACC, 1, 2), this.setOp(this.INS_ASL, 6, this.ADDR_ZP, 2, 5), this.setOp(this.INS_ASL, 22, this.ADDR_ZPX, 2, 6), this.setOp(this.INS_ASL, 14, this.ADDR_ABS, 3, 6), this.setOp(this.INS_ASL, 30, this.ADDR_ABSX, 3, 7), this.setOp(this.INS_BCC, 144, this.ADDR_REL, 2, 2), this.setOp(this.INS_BCS, 176, this.ADDR_REL, 2, 2), this.setOp(this.INS_BEQ, 240, this.ADDR_REL, 2, 2), this.setOp(this.INS_BIT, 36, this.ADDR_ZP, 2, 3), this.setOp(this.INS_BIT, 44, this.ADDR_ABS, 3, 4), this.setOp(this.INS_BMI, 48, this.ADDR_REL, 2, 2), this.setOp(this.INS_BNE, 208, this.ADDR_REL, 2, 2), this.setOp(this.INS_BPL, 16, this.ADDR_REL, 2, 2), this.setOp(this.INS_BRK, 0, this.ADDR_IMP, 1, 7), this.setOp(this.INS_BVC, 80, this.ADDR_REL, 2, 2), this.setOp(this.INS_BVS, 112, this.ADDR_REL, 2, 2), this.setOp(this.INS_CLC, 24, this.ADDR_IMP, 1, 2), this.setOp(this.INS_CLD, 216, this.ADDR_IMP, 1, 2), this.setOp(this.INS_CLI, 88, this.ADDR_IMP, 1, 2), this.setOp(this.INS_CLV, 184, this.ADDR_IMP, 1, 2), this.setOp(this.INS_CMP, 201, this.ADDR_IMM, 2, 2), this.setOp(this.INS_CMP, 197, this.ADDR_ZP, 2, 3), this.setOp(this.INS_CMP, 213, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_CMP, 205, this.ADDR_ABS, 3, 4), this.setOp(this.INS_CMP, 221, this.ADDR_ABSX, 3, 4), this.setOp(this.INS_CMP, 217, this.ADDR_ABSY, 3, 4), this.setOp(this.INS_CMP, 193, this.ADDR_PREIDXIND, 2, 6), this.setOp(this.INS_CMP, 209, this.ADDR_POSTIDXIND, 2, 5), this.setOp(this.INS_CPX, 224, this.ADDR_IMM, 2, 2), this.setOp(this.INS_CPX, 228, this.ADDR_ZP, 2, 3), this.setOp(this.INS_CPX, 236, this.ADDR_ABS, 3, 4), this.setOp(this.INS_CPY, 192, this.ADDR_IMM, 2, 2), this.setOp(this.INS_CPY, 196, this.ADDR_ZP, 2, 3), this.setOp(this.INS_CPY, 204, this.ADDR_ABS, 3, 4), this.setOp(this.INS_DEC, 198, this.ADDR_ZP, 2, 5), this.setOp(this.INS_DEC, 214, this.ADDR_ZPX, 2, 6), this.setOp(this.INS_DEC, 206, this.ADDR_ABS, 3, 6), this.setOp(this.INS_DEC, 222, this.ADDR_ABSX, 3, 7), this.setOp(this.INS_DEX, 202, this.ADDR_IMP, 1, 2), this.setOp(this.INS_DEY, 136, this.ADDR_IMP, 1, 2), this.setOp(this.INS_EOR, 73, this.ADDR_IMM, 2, 2), this.setOp(this.INS_EOR, 69, this.ADDR_ZP, 2, 3), this.setOp(this.INS_EOR, 85, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_EOR, 77, this.ADDR_ABS, 3, 4), this.setOp(this.INS_EOR, 93, this.ADDR_ABSX, 3, 4), this.setOp(this.INS_EOR, 89, this.ADDR_ABSY, 3, 4), this.setOp(this.INS_EOR, 65, this.ADDR_PREIDXIND, 2, 6), this.setOp(this.INS_EOR, 81, this.ADDR_POSTIDXIND, 2, 5), this.setOp(this.INS_INC, 230, this.ADDR_ZP, 2, 5), this.setOp(this.INS_INC, 246, this.ADDR_ZPX, 2, 6), this.setOp(this.INS_INC, 238, this.ADDR_ABS, 3, 6), this.setOp(this.INS_INC, 254, this.ADDR_ABSX, 3, 7), this.setOp(this.INS_INX, 232, this.ADDR_IMP, 1, 2), this.setOp(this.INS_INY, 200, this.ADDR_IMP, 1, 2), this.setOp(this.INS_JMP, 76, this.ADDR_ABS, 3, 3), this.setOp(this.INS_JMP, 108, this.ADDR_INDABS, 3, 5), this.setOp(this.INS_JSR, 32, this.ADDR_ABS, 3, 6), this.setOp(this.INS_LDA, 169, this.ADDR_IMM, 2, 2), this.setOp(this.INS_LDA, 165, this.ADDR_ZP, 2, 3), this.setOp(this.INS_LDA, 181, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_LDA, 173, this.ADDR_ABS, 3, 4), this.setOp(this.INS_LDA, 189, this.ADDR_ABSX, 3, 4), this.setOp(this.INS_LDA, 185, this.ADDR_ABSY, 3, 4), this.setOp(this.INS_LDA, 161, this.ADDR_PREIDXIND, 2, 6), this.setOp(this.INS_LDA, 177, this.ADDR_POSTIDXIND, 2, 5), this.setOp(this.INS_LDX, 162, this.ADDR_IMM, 2, 2), this.setOp(this.INS_LDX, 166, this.ADDR_ZP, 2, 3), this.setOp(this.INS_LDX, 182, this.ADDR_ZPY, 2, 4), this.setOp(this.INS_LDX, 174, this.ADDR_ABS, 3, 4), this.setOp(this.INS_LDX, 190, this.ADDR_ABSY, 3, 4), this.setOp(this.INS_LDY, 160, this.ADDR_IMM, 2, 2), this.setOp(this.INS_LDY, 164, this.ADDR_ZP, 2, 3), this.setOp(this.INS_LDY, 180, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_LDY, 172, this.ADDR_ABS, 3, 4), this.setOp(this.INS_LDY, 188, this.ADDR_ABSX, 3, 4), this.setOp(this.INS_LSR, 74, this.ADDR_ACC, 1, 2), this.setOp(this.INS_LSR, 70, this.ADDR_ZP, 2, 5), this.setOp(this.INS_LSR, 86, this.ADDR_ZPX, 2, 6), this.setOp(this.INS_LSR, 78, this.ADDR_ABS, 3, 6), this.setOp(this.INS_LSR, 94, this.ADDR_ABSX, 3, 7), this.setOp(this.INS_NOP, 234, this.ADDR_IMP, 1, 2), this.setOp(this.INS_ORA, 9, this.ADDR_IMM, 2, 2), this.setOp(this.INS_ORA, 5, this.ADDR_ZP, 2, 3), this.setOp(this.INS_ORA, 21, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_ORA, 13, this.ADDR_ABS, 3, 4), this.setOp(this.INS_ORA, 29, this.ADDR_ABSX, 3, 4), this.setOp(this.INS_ORA, 25, this.ADDR_ABSY, 3, 4), this.setOp(this.INS_ORA, 1, this.ADDR_PREIDXIND, 2, 6), this.setOp(this.INS_ORA, 17, this.ADDR_POSTIDXIND, 2, 5), this.setOp(this.INS_PHA, 72, this.ADDR_IMP, 1, 3), this.setOp(this.INS_PHP, 8, this.ADDR_IMP, 1, 3), this.setOp(this.INS_PLA, 104, this.ADDR_IMP, 1, 4), this.setOp(this.INS_PLP, 40, this.ADDR_IMP, 1, 4), this.setOp(this.INS_ROL, 42, this.ADDR_ACC, 1, 2), this.setOp(this.INS_ROL, 38, this.ADDR_ZP, 2, 5), this.setOp(this.INS_ROL, 54, this.ADDR_ZPX, 2, 6), this.setOp(this.INS_ROL, 46, this.ADDR_ABS, 3, 6), this.setOp(this.INS_ROL, 62, this.ADDR_ABSX, 3, 7), this.setOp(this.INS_ROR, 106, this.ADDR_ACC, 1, 2), this.setOp(this.INS_ROR, 102, this.ADDR_ZP, 2, 5), this.setOp(this.INS_ROR, 118, this.ADDR_ZPX, 2, 6), this.setOp(this.INS_ROR, 110, this.ADDR_ABS, 3, 6), this.setOp(this.INS_ROR, 126, this.ADDR_ABSX, 3, 7), this.setOp(this.INS_RTI, 64, this.ADDR_IMP, 1, 6), this.setOp(this.INS_RTS, 96, this.ADDR_IMP, 1, 6), this.setOp(this.INS_SBC, 233, this.ADDR_IMM, 2, 2), this.setOp(this.INS_SBC, 229, this.ADDR_ZP, 2, 3), this.setOp(this.INS_SBC, 245, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_SBC, 237, this.ADDR_ABS, 3, 4), this.setOp(this.INS_SBC, 253, this.ADDR_ABSX, 3, 4), this.setOp(this.INS_SBC, 249, this.ADDR_ABSY, 3, 4), this.setOp(this.INS_SBC, 225, this.ADDR_PREIDXIND, 2, 6), this.setOp(this.INS_SBC, 241, this.ADDR_POSTIDXIND, 2, 5), this.setOp(this.INS_SEC, 56, this.ADDR_IMP, 1, 2), this.setOp(this.INS_SED, 248, this.ADDR_IMP, 1, 2), this.setOp(this.INS_SEI, 120, this.ADDR_IMP, 1, 2), this.setOp(this.INS_STA, 133, this.ADDR_ZP, 2, 3), this.setOp(this.INS_STA, 149, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_STA, 141, this.ADDR_ABS, 3, 4), this.setOp(this.INS_STA, 157, this.ADDR_ABSX, 3, 5), this.setOp(this.INS_STA, 153, this.ADDR_ABSY, 3, 5), this.setOp(this.INS_STA, 129, this.ADDR_PREIDXIND, 2, 6), this.setOp(this.INS_STA, 145, this.ADDR_POSTIDXIND, 2, 6), this.setOp(this.INS_STX, 134, this.ADDR_ZP, 2, 3), this.setOp(this.INS_STX, 150, this.ADDR_ZPY, 2, 4), this.setOp(this.INS_STX, 142, this.ADDR_ABS, 3, 4), this.setOp(this.INS_STY, 132, this.ADDR_ZP, 2, 3), this.setOp(this.INS_STY, 148, this.ADDR_ZPX, 2, 4), this.setOp(this.INS_STY, 140, this.ADDR_ABS, 3, 4), this.setOp(this.INS_TAX, 170, this.ADDR_IMP, 1, 2), this.setOp(this.INS_TAY, 168, this.ADDR_IMP, 1, 2), this.setOp(this.INS_TSX, 186, this.ADDR_IMP, 1, 2), this.setOp(this.INS_TXA, 138, this.ADDR_IMP, 1, 2), this.setOp(this.INS_TXS, 154, this.ADDR_IMP, 1, 2), this.setOp(this.INS_TYA, 152, this.ADDR_IMP, 1, 2), this.cycTable = new Array(7, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 4, 4, 6, 6, 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7, 6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 4, 4, 6, 6, 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7, 6, 6, 2, 8, 3, 3, 5, 5, 3, 2, 2, 2, 3, 4, 6, 6, 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7, 6, 6, 2, 8, 3, 3, 5, 5, 4, 2, 2, 2, 5, 4, 6, 6, 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7, 2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4, 2, 6, 2, 6, 4, 4, 4, 4, 2, 5, 2, 5, 5, 5, 5, 5, 2, 6, 2, 6, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4, 2, 5, 2, 5, 4, 4, 4, 4, 2, 4, 2, 4, 4, 4, 4, 4, 2, 6, 2, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6, 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7, 2, 6, 3, 8, 3, 3, 5, 5, 2, 2, 2, 2, 4, 4, 6, 6, 2, 5, 2, 8, 4, 4, 6, 6, 2, 4, 2, 7, 4, 4, 7, 7), this.instname = new Array(56), this.instname[0] = "ADC", this.instname[1] = "AND", this.instname[2] = "ASL", this.instname[3] = "BCC", this.instname[4] = "BCS", this.instname[5] = "BEQ", this.instname[6] = "BIT", this.instname[7] = "BMI", this.instname[8] = "BNE", this.instname[9] = "BPL", this.instname[10] = "BRK", this.instname[11] = "BVC", this.instname[12] = "BVS", this.instname[13] = "CLC", this.instname[14] = "CLD", this.instname[15] = "CLI", this.instname[16] = "CLV", this.instname[17] = "CMP", this.instname[18] = "CPX", this.instname[19] = "CPY", this.instname[20] = "DEC", this.instname[21] = "DEX", this.instname[22] = "DEY", this.instname[23] = "EOR", this.instname[24] = "INC", this.instname[25] = "INX", this.instname[26] = "INY", this.instname[27] = "JMP", this.instname[28] = "JSR", this.instname[29] = "LDA", this.instname[30] = "LDX", this.instname[31] = "LDY", this.instname[32] = "LSR", this.instname[33] = "NOP", this.instname[34] = "ORA", this.instname[35] = "PHA", this.instname[36] = "PHP", this.instname[37] = "PLA", this.instname[38] = "PLP", this.instname[39] = "ROL", this.instname[40] = "ROR", this.instname[41] = "RTI", this.instname[42] = "RTS", this.instname[43] = "SBC", this.instname[44] = "SEC", this.instname[45] = "SED", this.instname[46] = "SEI", this.instname[47] = "STA", this.instname[48] = "STX", this.instname[49] = "STY", this.instname[50] = "TAX", this.instname[51] = "TAY", this.instname[52] = "TSX", this.instname[53] = "TXA", this.instname[54] = "TXS", this.instname[55] = "TYA", this.addrDesc = new Array("Zero Page           ", "Relative            ", "Implied             ", "Absolute            ", "Accumulator         ", "Immediate           ", "Zero Page,X         ", "Zero Page,Y         ", "Absolute,X          ", "Absolute,Y          ", "Preindexed Indirect ", "Postindexed Indirect", "Indirect Absolute   ")
}, JSNES.CPU.OpData.prototype = {
    INS_ADC: 0,
    INS_AND: 1,
    INS_ASL: 2,
    INS_BCC: 3,
    INS_BCS: 4,
    INS_BEQ: 5,
    INS_BIT: 6,
    INS_BMI: 7,
    INS_BNE: 8,
    INS_BPL: 9,
    INS_BRK: 10,
    INS_BVC: 11,
    INS_BVS: 12,
    INS_CLC: 13,
    INS_CLD: 14,
    INS_CLI: 15,
    INS_CLV: 16,
    INS_CMP: 17,
    INS_CPX: 18,
    INS_CPY: 19,
    INS_DEC: 20,
    INS_DEX: 21,
    INS_DEY: 22,
    INS_EOR: 23,
    INS_INC: 24,
    INS_INX: 25,
    INS_INY: 26,
    INS_JMP: 27,
    INS_JSR: 28,
    INS_LDA: 29,
    INS_LDX: 30,
    INS_LDY: 31,
    INS_LSR: 32,
    INS_NOP: 33,
    INS_ORA: 34,
    INS_PHA: 35,
    INS_PHP: 36,
    INS_PLA: 37,
    INS_PLP: 38,
    INS_ROL: 39,
    INS_ROR: 40,
    INS_RTI: 41,
    INS_RTS: 42,
    INS_SBC: 43,
    INS_SEC: 44,
    INS_SED: 45,
    INS_SEI: 46,
    INS_STA: 47,
    INS_STX: 48,
    INS_STY: 49,
    INS_TAX: 50,
    INS_TAY: 51,
    INS_TSX: 52,
    INS_TXA: 53,
    INS_TXS: 54,
    INS_TYA: 55,
    INS_DUMMY: 56,
    ADDR_ZP: 0,
    ADDR_REL: 1,
    ADDR_IMP: 2,
    ADDR_ABS: 3,
    ADDR_ACC: 4,
    ADDR_IMM: 5,
    ADDR_ZPX: 6,
    ADDR_ZPY: 7,
    ADDR_ABSX: 8,
    ADDR_ABSY: 9,
    ADDR_PREIDXIND: 10,
    ADDR_POSTIDXIND: 11,
    ADDR_INDABS: 12,
    setOp: function(a, b, c, d, e) {
        this.opdata[b] = 255 & a | (255 & c) << 8 | (255 & d) << 16 | (255 & e) << 24
    }
}, JSNES.Input = function() {
    var a;
    for (this.buttons = {
            BUTTON_A: 0,
            BUTTON_B: 1,
            BUTTON_SELECT: 2,
            BUTTON_START: 3,
            BUTTON_UP: 4,
            BUTTON_DOWN: 5,
            BUTTON_LEFT: 6,
            BUTTON_RIGHT: 7
        }, this.gamepads = [], this.activeGamepads = !1, this.state1 = new Array(8), a = 0; a < this.state1.length; a++) this.state1[a] = 64;
    for (this.state2 = new Array(8), a = 0; a < this.state2.length; a++) this.state2[a] = 64
}, JSNES.Input.prototype = {
    setKey: function(a, b) {
        if (this.activeGamepads) return !1;
        switch (a) {
            case 88:
                this.state1[this.buttons.BUTTON_A] = b;
                break;
            case 89:
                this.state1[this.buttons.BUTTON_B] = b;
                break;
            case 90:
                this.state1[this.buttons.BUTTON_B] = b;
                break;
            case 17:
                this.state1[this.buttons.BUTTON_SELECT] = b;
                break;
            case 13:
                this.state1[this.buttons.BUTTON_START] = b;
                break;
            case 38:
                this.state1[this.buttons.BUTTON_UP] = b;
                break;
            case 40:
                this.state1[this.buttons.BUTTON_DOWN] = b;
                break;
            case 37:
                this.state1[this.buttons.BUTTON_LEFT] = b;
                break;
            case 39:
                this.state1[this.buttons.BUTTON_RIGHT] = b;
                break;
            case 103:
                this.state2[this.buttons.BUTTON_A] = b;
                break;
            case 105:
                this.state2[this.buttons.BUTTON_B] = b;
                break;
            case 99:
                this.state2[this.buttons.BUTTON_SELECT] = b;
                break;
            case 97:
                this.state2[this.buttons.BUTTON_START] = b;
                break;
            case 104:
                this.state2[this.buttons.BUTTON_UP] = b;
                break;
            case 98:
                this.state2[this.buttons.BUTTON_DOWN] = b;
                break;
            case 100:
                this.state2[this.buttons.BUTTON_LEFT] = b;
                break;
            case 102:
                this.state2[this.buttons.BUTTON_RIGHT] = b;
                break;
            default:
                return !0
        }
        return !1
    },
    keyDown: function(a) {
        !this.setKey(a.keyCode, 65) && a.preventDefault && a.preventDefault()
    },
    keyUp: function(a) {
        !this.setKey(a.keyCode, 64) && a.preventDefault && a.preventDefault()
    },
    keyPress: function(a) {
        a.preventDefault()
    },
    setButton: function(a, b) {
        this.state1[a] = b ? 65 : 64
    },
    pollGamepads: function() {
        //for (var a = -1, b = !1, c = 0; c < this.gamepads.length; c++) {
        var a = -1;
        var b = !1;
        var c = 0;
        var d = this.gamepads[c];
            if (d) {// && d.connected) {
                a++, b = !0;
                var e = d.buttons,
                    f = (d.axes, 0 === a ? this.state1 : 1 === a ? this.state2 : void 0);
                //if (!f) break;

                //f[this.buttons.BUTTON_A] = e[1].pressed || e[3].pressed ? 65 : 64, f[this.buttons.BUTTON_B] = e[0].pressed || e[2].pressed ? 65 : 64, f[this.buttons.BUTTON_SELECT] = e[8].pressed ? 65 : 64, f[this.buttons.BUTTON_START] = e[9].pressed ? 65 : 64, f[this.buttons.BUTTON_UP] = e[12].pressed ? 65 : 64, f[this.buttons.BUTTON_DOWN] = e[13].pressed ? 65 : 64, f[this.buttons.BUTTON_LEFT] = e[14].pressed ? 65 : 64, f[this.buttons.BUTTON_RIGHT] = e[15].pressed ? 65 : 64
            }
        //}
        this.activeGamepads = b
    },
    gamepadConnected: function(a) {
        this.gamepads[0] = a
        document.getElementById("msg").innerHTML="Use Joystick";
        usingGamepad = true;
        checkGamepad(a);
    },
    gamepadDisconnected: function(a) {
        this.gamepads[0] = void 0
        document.getElementById("msg").innerHTML="Use Z,X and Cursor keys";
        usingGamepad = false;
    }
}, JSNES.Mappers = {}, JSNES.Mappers[0] = function(a) {
    this.nes = a
}, JSNES.Mappers[0].prototype = {
    reset: function() {
        this.joy1StrobeState = 0, this.joy2StrobeState = 0, this.joypadLastWrite = 0, this.mousePressed = !1, this.mouseX = null, this.mouseY = null
    },
    write: function(a, b) {
        8192 > a ? this.nes.cpu.mem[2047 & a] = b : a > 16407 ? this.nes.cpu.mem[a] = b : a > 8199 && 16384 > a ? this.regWrite(8192 + (7 & a), b) : this.regWrite(a, b)
    },
    writelow: function(a, b) {
        8192 > a ? this.nes.cpu.mem[2047 & a] = b : a > 16407 ? this.nes.cpu.mem[a] = b : a > 8199 && 16384 > a ? this.regWrite(8192 + (7 & a), b) : this.regWrite(a, b)
    },
    load: function(a) {
        return a &= 65535, a > 16407 ? this.nes.cpu.mem[a] : a >= 8192 ? this.regLoad(a) : this.nes.cpu.mem[2047 & a]
    },
    regLoad: function(a) {
        switch (a >> 12) {
            case 0:
                break;
            case 1:
                break;
            case 2:
            case 3:
                switch (7 & a) {
                    case 0:
                        return this.nes.cpu.mem[8192];
                    case 1:
                        return this.nes.cpu.mem[8193];
                    case 2:
                        return this.nes.ppu.readStatusRegister();
                    case 3:
                        return 0;
                    case 4:
                        return this.nes.ppu.sramLoad();
                    case 5:
                        return 0;
                    case 6:
                        return 0;
                    case 7:
                        return this.nes.ppu.vramLoad()
                }
                break;
            case 4:
                switch (a - 16405) {
                    case 0:
                        return this.nes.papu.readReg(a);
                    case 1:
                        return this.joy1Read();
                    case 2:
                        if (this.mousePressed) {
                            for (var b = Math.max(0, this.mouseX - 4), c = Math.min(256, this.mouseX + 4), d = Math.max(0, this.mouseY - 4), e = Math.min(240, this.mouseY + 4), f = 0, g = d; e > g; g++)
                                for (var h = b; c > h; h++)
                                    if (16777215 == this.nes.ppu.buffer[(g << 8) + h]) {
                                        f |= 8, console.debug("Clicked on white!");
                                        break
                                    }
                            return f |= this.mousePressed ? 16 : 0, 65535 & (this.joy2Read() | f)
                        }
                        return this.joy2Read()
                }
        }
        return 0
    },
    regWrite: function(a, b) {
        switch (a) {
            case 8192:
                this.nes.cpu.mem[a] = b, this.nes.ppu.updateControlReg1(b);
                break;
            case 8193:
                this.nes.cpu.mem[a] = b, this.nes.ppu.updateControlReg2(b);
                break;
            case 8195:
                this.nes.ppu.writeSRAMAddress(b);
                break;
            case 8196:
                this.nes.ppu.sramWrite(b);
                break;
            case 8197:
                this.nes.ppu.scrollWrite(b);
                break;
            case 8198:
                this.nes.ppu.writeVRAMAddress(b);
                break;
            case 8199:
                this.nes.ppu.vramWrite(b);
                break;
            case 16404:
                this.nes.ppu.sramDMA(b);
                break;
            case 16405:
                this.nes.papu.writeReg(a, b);
                break;
            case 16406:
                0 === (1 & b) && 1 === (1 & this.joypadLastWrite) && (this.joy1StrobeState = 0, this.joy2StrobeState = 0), this.joypadLastWrite = b;
                break;
            case 16407:
                this.nes.papu.writeReg(a, b);
                break;
            default:
                a >= 16384 && 16407 >= a && this.nes.papu.writeReg(a, b)
        }
    },
    joy1Read: function() {
        var a;
        switch (this.joy1StrobeState) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                a = this.nes.input.state1[this.joy1StrobeState];
                break;
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
                a = 0;
                break;
            case 19:
                a = 1;
                break;
            default:
                a = 0
        }
        return this.joy1StrobeState++, 24 == this.joy1StrobeState && (this.joy1StrobeState = 0), a
    },
    joy2Read: function() {
        var a;
        switch (this.joy2StrobeState) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                a = this.nes.input.state2[this.joy2StrobeState];
                break;
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
                a = 0;
                break;
            case 19:
                a = 1;
                break;
            default:
                a = 0
        }
        return this.joy2StrobeState++, 24 == this.joy2StrobeState && (this.joy2StrobeState = 0), a
    },
    loadROM: function() {
        return !this.nes.rom.valid || this.nes.rom.romCount < 1 ? void alert("NoMapper: Invalid ROM! Unable to load.") : (this.loadPRGROM(), this.loadCHRROM(), this.loadBatteryRam(), void this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET))
    },
    loadPRGROM: function() {
        this.nes.rom.romCount > 1 ? (this.loadRomBank(0, 32768), this.loadRomBank(1, 49152)) : (this.loadRomBank(0, 32768), this.loadRomBank(0, 49152))
    },
    loadCHRROM: function() {
        this.nes.rom.vromCount > 0 && (1 == this.nes.rom.vromCount ? (this.loadVromBank(0, 0), this.loadVromBank(0, 4096)) : (this.loadVromBank(0, 0), this.loadVromBank(1, 4096)))
    },
    loadBatteryRam: function() {
        if (this.nes.rom.batteryRam) {
            var a = this.nes.rom.batteryRam;
            null !== a && 8192 == a.length && JSNES.Utils.copyArrayElements(a, 0, this.nes.cpu.mem, 24576, 8192)
        }
    },
    loadRomBank: function(a, b) {
        a %= this.nes.rom.romCount, JSNES.Utils.copyArrayElements(this.nes.rom.rom[a], 0, this.nes.cpu.mem, b, 16384)
    },
    loadVromBank: function(a, b) {
        if (0 !== this.nes.rom.vromCount) {
            this.nes.ppu.triggerRendering(), JSNES.Utils.copyArrayElements(this.nes.rom.vrom[a % this.nes.rom.vromCount], 0, this.nes.ppu.vramMem, b, 4096);
            var c = this.nes.rom.vromTile[a % this.nes.rom.vromCount];
            JSNES.Utils.copyArrayElements(c, 0, this.nes.ppu.ptTile, b >> 4, 256)
        }
    },
    load32kRomBank: function(a, b) {
        this.loadRomBank(2 * a % this.nes.rom.romCount, b), this.loadRomBank((2 * a + 1) % this.nes.rom.romCount, b + 16384)
    },
    load8kVromBank: function(a, b) {
        0 !== this.nes.rom.vromCount && (this.nes.ppu.triggerRendering(), this.loadVromBank(a % this.nes.rom.vromCount, b), this.loadVromBank((a + 1) % this.nes.rom.vromCount, b + 4096))
    },
    load1kVromBank: function(a, b) {
        if (0 !== this.nes.rom.vromCount) {
            this.nes.ppu.triggerRendering();
            var c = Math.floor(a / 4) % this.nes.rom.vromCount,
                d = a % 4 * 1024;
            JSNES.Utils.copyArrayElements(this.nes.rom.vrom[c], 0, this.nes.ppu.vramMem, d, 1024);
            for (var e = this.nes.rom.vromTile[c], f = b >> 4, g = 0; 64 > g; g++) this.nes.ppu.ptTile[f + g] = e[(a % 4 << 6) + g]
        }
    },
    load2kVromBank: function(a, b) {
        if (0 !== this.nes.rom.vromCount) {
            this.nes.ppu.triggerRendering();
            var c = Math.floor(a / 2) % this.nes.rom.vromCount,
                d = a % 2 * 2048;
            JSNES.Utils.copyArrayElements(this.nes.rom.vrom[c], d, this.nes.ppu.vramMem, b, 2048);
            for (var e = this.nes.rom.vromTile[c], f = b >> 4, g = 0; 128 > g; g++) this.nes.ppu.ptTile[f + g] = e[(a % 2 << 7) + g]
        }
    },
    load8kRomBank: function(a, b) {
        var c = Math.floor(a / 2) % this.nes.rom.romCount,
            d = a % 2 * 8192;
        JSNES.Utils.copyArrayElements(this.nes.rom.rom[c], d, this.nes.cpu.mem, b, 8192)
    },
    clockIrqCounter: function() {},
    latchAccess: function() {},
    toJSON: function() {
        return {
            joy1StrobeState: this.joy1StrobeState,
            joy2StrobeState: this.joy2StrobeState,
            joypadLastWrite: this.joypadLastWrite
        }
    },
    fromJSON: function(a) {
        this.joy1StrobeState = a.joy1StrobeState, this.joy2StrobeState = a.joy2StrobeState, this.joypadLastWrite = a.joypadLastWrite
    }
}, JSNES.Mappers[1] = function(a) {
    this.nes = a
}, JSNES.Mappers[1].prototype = new JSNES.Mappers[0], JSNES.Mappers[1].prototype.reset = function() {
    JSNES.Mappers[0].prototype.reset.apply(this), this.regBuffer = 0, this.regBufferCounter = 0, this.mirroring = 0, this.oneScreenMirroring = 0, this.prgSwitchingArea = 1, this.prgSwitchingSize = 1, this.vromSwitchingSize = 0, this.romSelectionReg0 = 0, this.romSelectionReg1 = 0, this.romBankSelect = 0
}, JSNES.Mappers[1].prototype.write = function(a, b) {
    return 32768 > a ? void JSNES.Mappers[0].prototype.write.apply(this, arguments) : void(0 !== (128 & b) ? (this.regBufferCounter = 0, this.regBuffer = 0, 0 === this.getRegNumber(a) && (this.prgSwitchingArea = 1, this.prgSwitchingSize = 1)) : (this.regBuffer = this.regBuffer & 255 - (1 << this.regBufferCounter) | (1 & b) << this.regBufferCounter, this.regBufferCounter++, 5 == this.regBufferCounter && (this.setReg(this.getRegNumber(a), this.regBuffer), this.regBuffer = 0, this.regBufferCounter = 0)))
}, JSNES.Mappers[1].prototype.setReg = function(a, b) {
    var c;
    switch (a) {
        case 0:
            c = 3 & b, c !== this.mirroring && (this.mirroring = c, this.nes.ppu.setMirroring(0 === (2 & this.mirroring) ? this.nes.rom.SINGLESCREEN_MIRRORING : 0 !== (1 & this.mirroring) ? this.nes.rom.HORIZONTAL_MIRRORING : this.nes.rom.VERTICAL_MIRRORING)), this.prgSwitchingArea = b >> 2 & 1, this.prgSwitchingSize = b >> 3 & 1, this.vromSwitchingSize = b >> 4 & 1;
            break;
        case 1:
            this.romSelectionReg0 = b >> 4 & 1, this.nes.rom.vromCount > 0 && (0 === this.vromSwitchingSize ? 0 === this.romSelectionReg0 ? this.load8kVromBank(15 & b, 0) : this.load8kVromBank(Math.floor(this.nes.rom.vromCount / 2) + (15 & b), 0) : 0 === this.romSelectionReg0 ? this.loadVromBank(15 & b, 0) : this.loadVromBank(Math.floor(this.nes.rom.vromCount / 2) + (15 & b), 0));
            break;
        case 2:
            this.romSelectionReg1 = b >> 4 & 1, this.nes.rom.vromCount > 0 && 1 === this.vromSwitchingSize && (0 === this.romSelectionReg1 ? this.loadVromBank(15 & b, 4096) : this.loadVromBank(Math.floor(this.nes.rom.vromCount / 2) + (15 & b), 4096));
            break;
        default:
            c = 15 & b;
            var d, e = 0;
            this.nes.rom.romCount >= 32 ? 0 === this.vromSwitchingSize ? 1 === this.romSelectionReg0 && (e = 16) : e = (this.romSelectionReg0 | this.romSelectionReg1 << 1) << 3 : this.nes.rom.romCount >= 16 && 1 === this.romSelectionReg0 && (e = 8), 0 === this.prgSwitchingSize ? (d = e + (15 & b), this.load32kRomBank(d, 32768)) : (d = 2 * e + (15 & b), 0 === this.prgSwitchingArea ? this.loadRomBank(d, 49152) : this.loadRomBank(d, 32768))
    }
}, JSNES.Mappers[1].prototype.getRegNumber = function(a) {
    return a >= 32768 && 40959 >= a ? 0 : a >= 40960 && 49151 >= a ? 1 : a >= 49152 && 57343 >= a ? 2 : 3
}, JSNES.Mappers[1].prototype.loadROM = function() {
    return this.nes.rom.valid ? (this.loadRomBank(0, 32768), this.loadRomBank(this.nes.rom.romCount - 1, 49152), this.loadCHRROM(), this.loadBatteryRam(), void this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET)) : void alert("MMC1: Invalid ROM! Unable to load.")
}, JSNES.Mappers[1].prototype.switchLowHighPrgRom = function() {}, JSNES.Mappers[1].prototype.switch16to32 = function() {}, JSNES.Mappers[1].prototype.switch32to16 = function() {}, JSNES.Mappers[1].prototype.toJSON = function() {
    var a = JSNES.Mappers[0].prototype.toJSON.apply(this);
    return a.mirroring = this.mirroring, a.oneScreenMirroring = this.oneScreenMirroring, a.prgSwitchingArea = this.prgSwitchingArea, a.prgSwitchingSize = this.prgSwitchingSize, a.vromSwitchingSize = this.vromSwitchingSize, a.romSelectionReg0 = this.romSelectionReg0, a.romSelectionReg1 = this.romSelectionReg1, a.romBankSelect = this.romBankSelect, a.regBuffer = this.regBuffer, a.regBufferCounter = this.regBufferCounter, a
}, JSNES.Mappers[1].prototype.fromJSON = function(a) {
    JSNES.Mappers[0].prototype.fromJSON.apply(this, a), this.mirroring = a.mirroring, this.oneScreenMirroring = a.oneScreenMirroring, this.prgSwitchingArea = a.prgSwitchingArea, this.prgSwitchingSize = a.prgSwitchingSize, this.vromSwitchingSize = a.vromSwitchingSize, this.romSelectionReg0 = a.romSelectionReg0, this.romSelectionReg1 = a.romSelectionReg1, this.romBankSelect = a.romBankSelect, this.regBuffer = a.regBuffer, this.regBufferCounter = a.regBufferCounter
}, JSNES.Mappers[2] = function(a) {
    this.nes = a
}, JSNES.Mappers[2].prototype = new JSNES.Mappers[0], JSNES.Mappers[2].prototype.write = function(a, b) {
    return 32768 > a ? void JSNES.Mappers[0].prototype.write.apply(this, arguments) : void this.loadRomBank(b, 32768)
}, JSNES.Mappers[2].prototype.loadROM = function() {
    return this.nes.rom.valid ? (this.loadRomBank(0, 32768), this.loadRomBank(this.nes.rom.romCount - 1, 49152), this.loadCHRROM(), void this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET)) : void alert("UNROM: Invalid ROM! Unable to load.")
}, JSNES.Mappers[4] = function(a) {
    this.nes = a, this.CMD_SEL_2_1K_VROM_0000 = 0, this.CMD_SEL_2_1K_VROM_0800 = 1, this.CMD_SEL_1K_VROM_1000 = 2, this.CMD_SEL_1K_VROM_1400 = 3, this.CMD_SEL_1K_VROM_1800 = 4, this.CMD_SEL_1K_VROM_1C00 = 5, this.CMD_SEL_ROM_PAGE1 = 6, this.CMD_SEL_ROM_PAGE2 = 7, this.command = null, this.prgAddressSelect = null, this.chrAddressSelect = null, this.pageNumber = null, this.irqCounter = null, this.irqLatchValue = null, this.irqEnable = null, this.prgAddressChanged = !1
}, JSNES.Mappers[4].prototype = new JSNES.Mappers[0], JSNES.Mappers[4].prototype.write = function(a, b) {
    if (32768 > a) return void JSNES.Mappers[0].prototype.write.apply(this, arguments);
    switch (a) {
        case 32768:
            this.command = 7 & b;
            var c = b >> 6 & 1;
            c != this.prgAddressSelect && (this.prgAddressChanged = !0), this.prgAddressSelect = c, this.chrAddressSelect = b >> 7 & 1;
            break;
        case 32769:
            this.executeCommand(this.command, b);
            break;
        case 40960:
            this.nes.ppu.setMirroring(0 !== (1 & b) ? this.nes.rom.HORIZONTAL_MIRRORING : this.nes.rom.VERTICAL_MIRRORING);
            break;
        case 40961:
            break;
        case 49152:
            this.irqCounter = b;
            break;
        case 49153:
            this.irqLatchValue = b;
            break;
        case 57344:
            this.irqEnable = 0;
            break;
        case 57345:
            this.irqEnable = 1
    }
}, JSNES.Mappers[4].prototype.executeCommand = function(a, b) {
    switch (a) {
        case this.CMD_SEL_2_1K_VROM_0000:
            0 === this.chrAddressSelect ? (this.load1kVromBank(b, 0), this.load1kVromBank(b + 1, 1024)) : (this.load1kVromBank(b, 4096), this.load1kVromBank(b + 1, 5120));
            break;
        case this.CMD_SEL_2_1K_VROM_0800:
            0 === this.chrAddressSelect ? (this.load1kVromBank(b, 2048), this.load1kVromBank(b + 1, 3072)) : (this.load1kVromBank(b, 6144), this.load1kVromBank(b + 1, 7168));
            break;
        case this.CMD_SEL_1K_VROM_1000:
            0 === this.chrAddressSelect ? this.load1kVromBank(b, 4096) : this.load1kVromBank(b, 0);
            break;
        case this.CMD_SEL_1K_VROM_1400:
            0 === this.chrAddressSelect ? this.load1kVromBank(b, 5120) : this.load1kVromBank(b, 1024);
            break;
        case this.CMD_SEL_1K_VROM_1800:
            0 === this.chrAddressSelect ? this.load1kVromBank(b, 6144) : this.load1kVromBank(b, 2048);
            break;
        case this.CMD_SEL_1K_VROM_1C00:
            0 === this.chrAddressSelect ? this.load1kVromBank(b, 7168) : this.load1kVromBank(b, 3072);
            break;
        case this.CMD_SEL_ROM_PAGE1:
            this.prgAddressChanged && (0 === this.prgAddressSelect ? this.load8kRomBank(2 * (this.nes.rom.romCount - 1), 49152) : this.load8kRomBank(2 * (this.nes.rom.romCount - 1), 32768), this.prgAddressChanged = !1), 0 === this.prgAddressSelect ? this.load8kRomBank(b, 32768) : this.load8kRomBank(b, 49152);
            break;
        case this.CMD_SEL_ROM_PAGE2:
            this.load8kRomBank(b, 40960), this.prgAddressChanged && (0 === this.prgAddressSelect ? this.load8kRomBank(2 * (this.nes.rom.romCount - 1), 49152) : this.load8kRomBank(2 * (this.nes.rom.romCount - 1), 32768), this.prgAddressChanged = !1)
    }
}, JSNES.Mappers[4].prototype.loadROM = function() {
    return this.nes.rom.valid ? (this.load8kRomBank(2 * (this.nes.rom.romCount - 1), 49152), this.load8kRomBank(2 * (this.nes.rom.romCount - 1) + 1, 57344), this.load8kRomBank(0, 32768), this.load8kRomBank(1, 40960), this.loadCHRROM(), this.loadBatteryRam(), void this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET)) : void alert("MMC3: Invalid ROM! Unable to load.")
}, JSNES.Mappers[4].prototype.clockIrqCounter = function() {
    1 == this.irqEnable && (this.irqCounter--, this.irqCounter < 0 && (this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NORMAL), this.irqCounter = this.irqLatchValue))
}, JSNES.Mappers[4].prototype.toJSON = function() {
    var a = JSNES.Mappers[0].prototype.toJSON.apply(this);
    return a.command = this.command, a.prgAddressSelect = this.prgAddressSelect, a.chrAddressSelect = this.chrAddressSelect, a.pageNumber = this.pageNumber, a.irqCounter = this.irqCounter, a.irqLatchValue = this.irqLatchValue, a.irqEnable = this.irqEnable, a.prgAddressChanged = this.prgAddressChanged, a
}, JSNES.Mappers[4].prototype.fromJSON = function(a) {
    JSNES.Mappers[0].prototype.fromJSON.apply(this, a), this.command = a.command, this.prgAddressSelect = a.prgAddressSelect, this.chrAddressSelect = a.chrAddressSelect, this.pageNumber = a.pageNumber, this.irqCounter = a.irqCounter, this.irqLatchValue = a.irqLatchValue, this.irqEnable = a.irqEnable, this.prgAddressChanged = a.prgAddressChanged
}, JSNES.PAPU = function(a) {
    this.nes = a, this.square1 = new JSNES.PAPU.ChannelSquare(this, !0), this.square2 = new JSNES.PAPU.ChannelSquare(this, !1), this.triangle = new JSNES.PAPU.ChannelTriangle(this), this.noise = new JSNES.PAPU.ChannelNoise(this), this.dmc = new JSNES.PAPU.ChannelDM(this), this.frameIrqCounter = null, this.frameIrqCounterMax = 4, this.initCounter = 2048, this.channelEnableValue = null, this.bufferSize = 8192, this.bufferIndex = 0, this.sampleRate = 44100, this.lengthLookup = null, this.dmcFreqLookup = null, this.noiseWavelengthLookup = null, this.square_table = null, this.tnd_table = null, this.leftSampleBuffer = new Array(this.bufferSize), this.rightSampleBuffer = new Array(this.bufferSize), this.frameIrqEnabled = !1, this.frameIrqActive = null, this.frameClockNow = null, this.startedPlaying = !1, this.recordOutput = !1, this.initingHardware = !1, this.masterFrameCounter = null, this.derivedFrameCounter = null, this.countSequence = null, this.sampleTimer = null, this.frameTime = null, this.sampleTimerMax = null, this.sampleCount = null, this.triValue = 0, this.smpSquare1 = null, this.smpSquare2 = null, this.smpTriangle = null, this.smpDmc = null, this.accCount = null, this.prevSampleL = 0, this.prevSampleR = 0, this.smpAccumL = 0, this.smpAccumR = 0, this.dacRange = 0, this.dcValue = 0, this.masterVolume = 256, this.stereoPosLSquare1 = null, this.stereoPosLSquare2 = null, this.stereoPosLTriangle = null, this.stereoPosLNoise = null, this.stereoPosLDMC = null, this.stereoPosRSquare1 = null, this.stereoPosRSquare2 = null, this.stereoPosRTriangle = null, this.stereoPosRNoise = null, this.stereoPosRDMC = null, this.extraCycles = null, this.maxSample = null, this.minSample = null, this.panning = [80, 170, 100, 150, 128], this.setPanning(this.panning), this.initLengthLookup(), this.initDmcFrequencyLookup(), this.initNoiseWavelengthLookup(), this.initDACtables();
    for (var b = 0; 20 > b; b++) 16 === b ? this.writeReg(16400, 16) : this.writeReg(16384 + b, 0);
    this.reset()
}, JSNES.PAPU.prototype = {
    reset: function() {
        this.sampleRate = this.nes.opts.sampleRate, this.sampleTimerMax = Math.floor(1024 * this.nes.opts.CPU_FREQ_NTSC * this.nes.opts.preferredFrameRate / ((60 / 2) * this.sampleRate)), this.frameTime = Math.floor(14915 * this.nes.opts.preferredFrameRate / 60), this.sampleTimer = 0, this.bufferIndex = 0, this.updateChannelEnable(0), this.masterFrameCounter = 0, this.derivedFrameCounter = 0, this.countSequence = 0, this.sampleCount = 0, this.initCounter = 2048, this.frameIrqEnabled = !1, this.initingHardware = !1, this.resetCounter(), this.square1.reset(), this.square2.reset(), this.triangle.reset(), this.noise.reset(), this.dmc.reset(), this.bufferIndex = 0, this.accCount = 0, this.smpSquare1 = 0, this.smpSquare2 = 0, this.smpTriangle = 0, this.smpDmc = 0, this.frameIrqEnabled = !1, this.frameIrqCounterMax = 4, this.channelEnableValue = 255, this.startedPlaying = !1, this.prevSampleL = 0, this.prevSampleR = 0, this.smpAccumL = 0, this.smpAccumR = 0, this.maxSample = -5e5, this.minSample = 5e5
    },
    readReg: function() {
        var a = 0;
        return a |= this.square1.getLengthStatus(), a |= this.square2.getLengthStatus() << 1, a |= this.triangle.getLengthStatus() << 2, a |= this.noise.getLengthStatus() << 3, a |= this.dmc.getLengthStatus() << 4, a |= (this.frameIrqActive && this.frameIrqEnabled ? 1 : 0) << 6, a |= this.dmc.getIrqStatus() << 7, this.frameIrqActive = !1, this.dmc.irqGenerated = !1, 65535 & a
    },
    writeReg: function(a, b) {
        a >= 16384 && 16388 > a ? this.square1.writeReg(a, b) : a >= 16388 && 16392 > a ? this.square2.writeReg(a, b) : a >= 16392 && 16396 > a ? this.triangle.writeReg(a, b) : a >= 16396 && 16399 >= a ? this.noise.writeReg(a, b) : 16400 === a ? this.dmc.writeReg(a, b) : 16401 === a ? this.dmc.writeReg(a, b) : 16402 === a ? this.dmc.writeReg(a, b) : 16403 === a ? this.dmc.writeReg(a, b) : 16405 === a ? (this.updateChannelEnable(b), 0 !== b && this.initCounter > 0 && (this.initingHardware = !0), this.dmc.writeReg(a, b)) : 16407 === a && (this.countSequence = b >> 7 & 1, this.masterFrameCounter = 0, this.frameIrqActive = !1, this.frameIrqEnabled = 0 === (b >> 6 & 1) ? !0 : !1, 0 === this.countSequence ? (this.frameIrqCounterMax = 4, this.derivedFrameCounter = 4) : (this.frameIrqCounterMax = 5, this.derivedFrameCounter = 0, this.frameCounterTick()))
    },
    resetCounter: function() {
        this.derivedFrameCounter = 0 === this.countSequence ? 4 : 0
    },
    updateChannelEnable: function(a) {
        this.channelEnableValue = 65535 & a, this.square1.setEnabled(0 !== (1 & a)), this.square2.setEnabled(0 !== (2 & a)), this.triangle.setEnabled(0 !== (4 & a)), this.noise.setEnabled(0 !== (8 & a)), this.dmc.setEnabled(0 !== (16 & a))
    },
    clockFrameCounter: function(a) {
        if (this.initCounter > 0 && this.initingHardware) return this.initCounter -= a, void(this.initCounter <= 0 && (this.initingHardware = !1));
        a += this.extraCycles;
        var b = this.sampleTimerMax - this.sampleTimer;
        a << 10 > b ? (this.extraCycles = (a << 10) - b >> 10, a -= this.extraCycles) : this.extraCycles = 0;
        var c = this.dmc,
            d = this.triangle,
            e = this.square1,
            f = this.square2,
            g = this.noise;
        if (c.isEnabled)
            for (c.shiftCounter -= a << 3; c.shiftCounter <= 0 && c.dmaFrequency > 0;) c.shiftCounter += c.dmaFrequency, c.clockDmc();
        if (d.progTimerMax > 0)
            for (d.progTimerCount -= a; d.progTimerCount <= 0;) d.progTimerCount += d.progTimerMax + 1, d.linearCounter > 0 && d.lengthCounter > 0 && (d.triangleCounter++, d.triangleCounter &= 31, d.isEnabled && (d.sampleValue = d.triangleCounter >= 16 ? 15 & d.triangleCounter : 15 - (15 & d.triangleCounter), d.sampleValue <<= 4));
        e.progTimerCount -= a, e.progTimerCount <= 0 && (e.progTimerCount += e.progTimerMax + 1 << 1, e.squareCounter++, e.squareCounter &= 7, e.updateSampleValue()), f.progTimerCount -= a, f.progTimerCount <= 0 && (f.progTimerCount += f.progTimerMax + 1 << 1, f.squareCounter++, f.squareCounter &= 7, f.updateSampleValue());
        var h = a;
        if (g.progTimerCount - h > 0) g.progTimerCount -= h, g.accCount += h, g.accValue += h * g.sampleValue;
        else
            for (; h-- > 0;) --g.progTimerCount <= 0 && g.progTimerMax > 0 && (g.shiftReg <<= 1, g.tmp = 32768 & (g.shiftReg << (0 === g.randomMode ? 1 : 6) ^ g.shiftReg), 0 !== g.tmp ? (g.shiftReg |= 1, g.randomBit = 0, g.sampleValue = 0) : (g.randomBit = 1, g.sampleValue = g.isEnabled && g.lengthCounter > 0 ? g.masterVolume : 0), g.progTimerCount += g.progTimerMax), g.accValue += g.sampleValue, g.accCount++;
        this.frameIrqEnabled && this.frameIrqActive && this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NORMAL), this.masterFrameCounter += a << 1, this.masterFrameCounter >= this.frameTime && (this.masterFrameCounter -= this.frameTime, this.frameCounterTick()), this.accSample(a), this.sampleTimer += a << 10, this.sampleTimer >= this.sampleTimerMax && (this.sample(), this.sampleTimer -= this.sampleTimerMax)
    },
    accSample: function(a) {
        this.triangle.sampleCondition && (this.triValue = Math.floor((this.triangle.progTimerCount << 4) / (this.triangle.progTimerMax + 1)), this.triValue > 16 && (this.triValue = 16), this.triangle.triangleCounter >= 16 && (this.triValue = 16 - this.triValue), this.triValue += this.triangle.sampleValue), 2 === a ? (this.smpTriangle += this.triValue << 1, this.smpDmc += this.dmc.sample << 1, this.smpSquare1 += this.square1.sampleValue << 1, this.smpSquare2 += this.square2.sampleValue << 1, this.accCount += 2) : 4 === a ? (this.smpTriangle += this.triValue << 2, this.smpDmc += this.dmc.sample << 2, this.smpSquare1 += this.square1.sampleValue << 2, this.smpSquare2 += this.square2.sampleValue << 2, this.accCount += 4) : (this.smpTriangle += a * this.triValue, this.smpDmc += a * this.dmc.sample, this.smpSquare1 += a * this.square1.sampleValue, this.smpSquare2 += a * this.square2.sampleValue, this.accCount += a)
    },
    frameCounterTick: function() {
        this.derivedFrameCounter++, this.derivedFrameCounter >= this.frameIrqCounterMax && (this.derivedFrameCounter = 0), (1 === this.derivedFrameCounter || 3 === this.derivedFrameCounter) && (this.triangle.clockLengthCounter(), this.square1.clockLengthCounter(), this.square2.clockLengthCounter(), this.noise.clockLengthCounter(), this.square1.clockSweep(), this.square2.clockSweep()), this.derivedFrameCounter >= 0 && this.derivedFrameCounter < 4 && (this.square1.clockEnvDecay(), this.square2.clockEnvDecay(), this.noise.clockEnvDecay(), this.triangle.clockLinearCounter()), 3 === this.derivedFrameCounter && 0 === this.countSequence && (this.frameIrqActive = !0)
    },
    sample: function() {
        var a, b;
        this.accCount > 0 ? (this.smpSquare1 <<= 4, this.smpSquare1 = Math.floor(this.smpSquare1 / this.accCount), this.smpSquare2 <<= 4, this.smpSquare2 = Math.floor(this.smpSquare2 / this.accCount), this.smpTriangle = Math.floor(this.smpTriangle / this.accCount), this.smpDmc <<= 4, this.smpDmc = Math.floor(this.smpDmc / this.accCount), this.accCount = 0) : (this.smpSquare1 = this.square1.sampleValue << 4, this.smpSquare2 = this.square2.sampleValue << 4, this.smpTriangle = this.triangle.sampleValue, this.smpDmc = this.dmc.sample << 4);
        var c = Math.floor((this.noise.accValue << 4) / this.noise.accCount);
        this.noise.accValue = c >> 4, this.noise.accCount = 1, a = this.smpSquare1 * this.stereoPosLSquare1 + this.smpSquare2 * this.stereoPosLSquare2 >> 8, b = 3 * this.smpTriangle * this.stereoPosLTriangle + (c << 1) * this.stereoPosLNoise + this.smpDmc * this.stereoPosLDMC >> 8, a >= this.square_table.length && (a = this.square_table.length - 1), b >= this.tnd_table.length && (b = this.tnd_table.length - 1);
        var d = this.square_table[a] + this.tnd_table[b] - this.dcValue;
        a = this.smpSquare1 * this.stereoPosRSquare1 + this.smpSquare2 * this.stereoPosRSquare2 >> 8, b = 3 * this.smpTriangle * this.stereoPosRTriangle + (c << 1) * this.stereoPosRNoise + this.smpDmc * this.stereoPosRDMC >> 8, a >= this.square_table.length && (a = this.square_table.length - 1), b >= this.tnd_table.length && (b = this.tnd_table.length - 1);
        var e = this.square_table[a] + this.tnd_table[b] - this.dcValue,
            f = d - this.prevSampleL;
        this.prevSampleL += f, this.smpAccumL += f - (this.smpAccumL >> 10), d = this.smpAccumL, d /= 32768;
        var g = e - this.prevSampleR;
        this.prevSampleR += g, this.smpAccumR += g - (this.smpAccumR >> 10), e = this.smpAccumR, e /= 32768, d > this.maxSample && (this.maxSample = d), d < this.minSample && (this.minSample = d), this.leftSampleBuffer[this.bufferIndex++] = d, this.rightSampleBuffer[this.bufferIndex++] = e, this.bufferIndex === this.leftSampleBuffer.length && (this.nes.ui.writeAudio(this.leftSampleBuffer, this.rightSampleBuffer), this.leftSampleBuffer = new Array(this.bufferSize), this.rightSampleBuffer = new Array(this.bufferSize), this.bufferIndex = 0), this.smpSquare1 = 0, this.smpSquare2 = 0, this.smpTriangle = 0, this.smpDmc = 0
    },
    getLengthMax: function(a) {
        return this.lengthLookup[a >> 3]
    },
    getDmcFrequency: function(a) {
        return a >= 0 && 16 > a ? this.dmcFreqLookup[a] : 0
    },
    getNoiseWaveLength: function(a) {
        return a >= 0 && 16 > a ? this.noiseWavelengthLookup[a] : 0
    },
    setPanning: function(a) {
        for (var b = 0; 5 > b; b++) this.panning[b] = a[b];
        this.updateStereoPos()
    },
    setMasterVolume: function(a) {
        0 > a && (a = 0), a > 256 && (a = 256), this.masterVolume = a, this.updateStereoPos()
    },
    updateStereoPos: function() {
        this.stereoPosLSquare1 = this.panning[0] * this.masterVolume >> 8, this.stereoPosLSquare2 = this.panning[1] * this.masterVolume >> 8, this.stereoPosLTriangle = this.panning[2] * this.masterVolume >> 8, this.stereoPosLNoise = this.panning[3] * this.masterVolume >> 8, this.stereoPosLDMC = this.panning[4] * this.masterVolume >> 8, this.stereoPosRSquare1 = this.masterVolume - this.stereoPosLSquare1, this.stereoPosRSquare2 = this.masterVolume - this.stereoPosLSquare2, this.stereoPosRTriangle = this.masterVolume - this.stereoPosLTriangle, this.stereoPosRNoise = this.masterVolume - this.stereoPosLNoise, this.stereoPosRDMC = this.masterVolume - this.stereoPosLDMC
    },
    initLengthLookup: function() {
        this.lengthLookup = [10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30]
    },
    initDmcFrequencyLookup: function() {
        this.dmcFreqLookup = new Array(16), this.dmcFreqLookup[0] = 3424, this.dmcFreqLookup[1] = 3040, this.dmcFreqLookup[2] = 2720, this.dmcFreqLookup[3] = 2560, this.dmcFreqLookup[4] = 2288, this.dmcFreqLookup[5] = 2032, this.dmcFreqLookup[6] = 1808, this.dmcFreqLookup[7] = 1712, this.dmcFreqLookup[8] = 1520, this.dmcFreqLookup[9] = 1280, this.dmcFreqLookup[10] = 1136, this.dmcFreqLookup[11] = 1024, this.dmcFreqLookup[12] = 848, this.dmcFreqLookup[13] = 672, this.dmcFreqLookup[14] = 576, this.dmcFreqLookup[15] = 432
    },
    initNoiseWavelengthLookup: function() {
        this.noiseWavelengthLookup = new Array(16), this.noiseWavelengthLookup[0] = 4, this.noiseWavelengthLookup[1] = 8, this.noiseWavelengthLookup[2] = 16, this.noiseWavelengthLookup[3] = 32, this.noiseWavelengthLookup[4] = 64, this.noiseWavelengthLookup[5] = 96, this.noiseWavelengthLookup[6] = 128, this.noiseWavelengthLookup[7] = 160, this.noiseWavelengthLookup[8] = 202, this.noiseWavelengthLookup[9] = 254, this.noiseWavelengthLookup[10] = 380, this.noiseWavelengthLookup[11] = 508, this.noiseWavelengthLookup[12] = 762, this.noiseWavelengthLookup[13] = 1016, this.noiseWavelengthLookup[14] = 2034, this.noiseWavelengthLookup[15] = 4068
    },
    initDACtables: function() {
        var a, b, c, d = 0,
            e = 0;
        for (this.square_table = new Array(512), this.tnd_table = new Array(3264), c = 0; 512 > c; c++) a = 95.52 / (8128 / (c / 16) + 100), a *= .98411, a *= 5e4, b = Math.floor(a), this.square_table[c] = b, b > d && (d = b);
        for (c = 0; 3264 > c; c++) a = 163.67 / (24329 / (c / 16) + 100), a *= .98411, a *= 5e4, b = Math.floor(a), this.tnd_table[c] = b, b > e && (e = b);
        this.dacRange = d + e, this.dcValue = this.dacRange / 2
    }
}, JSNES.PAPU.ChannelDM = function(a) {
    this.papu = a, this.MODE_NORMAL = 0, this.MODE_LOOP = 1, this.MODE_IRQ = 2, this.isEnabled = null, this.hasSample = null, this.irqGenerated = !1, this.playMode = null, this.dmaFrequency = null, this.dmaCounter = null, this.deltaCounter = null, this.playStartAddress = null, this.playAddress = null, this.playLength = null, this.playLengthCounter = null, this.shiftCounter = null, this.reg4012 = null, this.reg4013 = null, this.sample = null, this.dacLsb = null, this.data = null, this.reset()
}, JSNES.PAPU.ChannelDM.prototype = {
    clockDmc: function() {
        this.hasSample && (0 === (1 & this.data) ? this.deltaCounter > 0 && this.deltaCounter-- : this.deltaCounter < 63 && this.deltaCounter++, this.sample = this.isEnabled ? (this.deltaCounter << 1) + this.dacLsb : 0, this.data >>= 1), this.dmaCounter--, this.dmaCounter <= 0 && (this.hasSample = !1, this.endOfSample(), this.dmaCounter = 8), this.irqGenerated && this.papu.nes.cpu.requestIrq(this.papu.nes.cpu.IRQ_NORMAL)
    },
    endOfSample: function() {
        0 === this.playLengthCounter && this.playMode === this.MODE_LOOP && (this.playAddress = this.playStartAddress, this.playLengthCounter = this.playLength), this.playLengthCounter > 0 && (this.nextSample(), 0 === this.playLengthCounter && this.playMode === this.MODE_IRQ && (this.irqGenerated = !0))
    },
    nextSample: function() {
        this.data = this.papu.nes.mmap.load(this.playAddress), this.papu.nes.cpu.haltCycles(4), this.playLengthCounter--, this.playAddress++, this.playAddress > 65535 && (this.playAddress = 32768), this.hasSample = !0
    },
    writeReg: function(a, b) {
        16400 === a ? (b >> 6 === 0 ? this.playMode = this.MODE_NORMAL : 1 === (b >> 6 & 1) ? this.playMode = this.MODE_LOOP : b >> 6 === 2 && (this.playMode = this.MODE_IRQ), 0 === (128 & b) && (this.irqGenerated = !1), this.dmaFrequency = this.papu.getDmcFrequency(15 & b)) : 16401 === a ? (this.deltaCounter = b >> 1 & 63, this.dacLsb = 1 & b, this.sample = (this.deltaCounter << 1) + this.dacLsb) : 16402 === a ? (this.playStartAddress = b << 6 | 49152, this.playAddress = this.playStartAddress, this.reg4012 = b) : 16403 === a ? (this.playLength = (b << 4) + 1, this.playLengthCounter = this.playLength, this.reg4013 = b) : 16405 === a && (0 === (b >> 4 & 1) ? this.playLengthCounter = 0 : (this.playAddress = this.playStartAddress, this.playLengthCounter = this.playLength), this.irqGenerated = !1)
    },
    setEnabled: function(a) {
        !this.isEnabled && a && (this.playLengthCounter = this.playLength), this.isEnabled = a
    },
    getLengthStatus: function() {
        return 0 !== this.playLengthCounter && this.isEnabled ? 1 : 0
    },
    getIrqStatus: function() {
        return this.irqGenerated ? 1 : 0
    },
    reset: function() {
        this.isEnabled = !1, this.irqGenerated = !1, this.playMode = this.MODE_NORMAL, this.dmaFrequency = 0, this.dmaCounter = 0, this.deltaCounter = 0, this.playStartAddress = 0, this.playAddress = 0, this.playLength = 0, this.playLengthCounter = 0, this.sample = 0, this.dacLsb = 0, this.shiftCounter = 0, this.reg4012 = 0, this.reg4013 = 0, this.data = 0
    }
}, JSNES.PAPU.ChannelNoise = function(a) {
    this.papu = a, this.isEnabled = null, this.envDecayDisable = null, this.envDecayLoopEnable = null, this.lengthCounterEnable = null, this.envReset = null, this.shiftNow = null, this.lengthCounter = null, this.progTimerCount = null, this.progTimerMax = null, this.envDecayRate = null, this.envDecayCounter = null, this.envVolume = null, this.masterVolume = null, this.shiftReg = 16384, this.randomBit = null, this.randomMode = null, this.sampleValue = null, this.accValue = 0, this.accCount = 1, this.tmp = null, this.reset()
}, JSNES.PAPU.ChannelNoise.prototype = {
    reset: function() {
        this.progTimerCount = 0, this.progTimerMax = 0, this.isEnabled = !1, this.lengthCounter = 0, this.lengthCounterEnable = !1, this.envDecayDisable = !1, this.envDecayLoopEnable = !1, this.shiftNow = !1, this.envDecayRate = 0, this.envDecayCounter = 0, this.envVolume = 0, this.masterVolume = 0, this.shiftReg = 1, this.randomBit = 0, this.randomMode = 0, this.sampleValue = 0, this.tmp = 0
    },
    clockLengthCounter: function() {
        this.lengthCounterEnable && this.lengthCounter > 0 && (this.lengthCounter--, 0 === this.lengthCounter && this.updateSampleValue())
    },
    clockEnvDecay: function() {
        this.envReset ? (this.envReset = !1, this.envDecayCounter = this.envDecayRate + 1, this.envVolume = 15) : --this.envDecayCounter <= 0 && (this.envDecayCounter = this.envDecayRate + 1, this.envVolume > 0 ? this.envVolume-- : this.envVolume = this.envDecayLoopEnable ? 15 : 0), this.masterVolume = this.envDecayDisable ? this.envDecayRate : this.envVolume, this.updateSampleValue()
    },
    updateSampleValue: function() {
        this.isEnabled && this.lengthCounter > 0 && (this.sampleValue = this.randomBit * this.masterVolume)
    },
    writeReg: function(a, b) {
        16396 === a ? (this.envDecayDisable = 0 !== (16 & b), this.envDecayRate = 15 & b, this.envDecayLoopEnable = 0 !== (32 & b), this.lengthCounterEnable = 0 === (32 & b), this.masterVolume = this.envDecayDisable ? this.envDecayRate : this.envVolume) : 16398 === a ? (this.progTimerMax = this.papu.getNoiseWaveLength(15 & b), this.randomMode = b >> 7) : 16399 === a && (this.lengthCounter = this.papu.getLengthMax(248 & b), this.envReset = !0)
    },
    setEnabled: function(a) {
        this.isEnabled = a, a || (this.lengthCounter = 0), this.updateSampleValue()
    },
    getLengthStatus: function() {
        return 0 !== this.lengthCounter && this.isEnabled ? 1 : 0
    }
}, JSNES.PAPU.ChannelSquare = function(a, b) {
    this.papu = a, this.dutyLookup = [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1], this.impLookup = [1, -1, 0, 0, 0, 0, 0, 0, 1, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 0], this.sqr1 = b, this.isEnabled = null, this.lengthCounterEnable = null, this.sweepActive = null, this.envDecayDisable = null, this.envDecayLoopEnable = null, this.envReset = null, this.sweepCarry = null, this.updateSweepPeriod = null, this.progTimerCount = null, this.progTimerMax = null, this.lengthCounter = null, this.squareCounter = null, this.sweepCounter = null, this.sweepCounterMax = null, this.sweepMode = null, this.sweepShiftAmount = null, this.envDecayRate = null, this.envDecayCounter = null, this.envVolume = null, this.masterVolume = null, this.dutyMode = null, this.sweepResult = null, this.sampleValue = null, this.vol = null, this.reset()
}, JSNES.PAPU.ChannelSquare.prototype = {
    reset: function() {
        this.progTimerCount = 0, this.progTimerMax = 0, this.lengthCounter = 0, this.squareCounter = 0, this.sweepCounter = 0, this.sweepCounterMax = 0, this.sweepMode = 0, this.sweepShiftAmount = 0, this.envDecayRate = 0, this.envDecayCounter = 0, this.envVolume = 0, this.masterVolume = 0, this.dutyMode = 0, this.vol = 0, this.isEnabled = !1, this.lengthCounterEnable = !1, this.sweepActive = !1, this.sweepCarry = !1, this.envDecayDisable = !1, this.envDecayLoopEnable = !1
    },
    clockLengthCounter: function() {
        this.lengthCounterEnable && this.lengthCounter > 0 && (this.lengthCounter--, 0 === this.lengthCounter && this.updateSampleValue())
    },
    clockEnvDecay: function() {
        this.envReset ? (this.envReset = !1, this.envDecayCounter = this.envDecayRate + 1, this.envVolume = 15) : --this.envDecayCounter <= 0 && (this.envDecayCounter = this.envDecayRate + 1, this.envVolume > 0 ? this.envVolume-- : this.envVolume = this.envDecayLoopEnable ? 15 : 0), this.masterVolume = this.envDecayDisable ? this.envDecayRate : this.envVolume, this.updateSampleValue()
    },
    clockSweep: function() {
        --this.sweepCounter <= 0 && (this.sweepCounter = this.sweepCounterMax + 1, this.sweepActive && this.sweepShiftAmount > 0 && this.progTimerMax > 7 && (this.sweepCarry = !1, 0 === this.sweepMode ? (this.progTimerMax += this.progTimerMax >> this.sweepShiftAmount, this.progTimerMax > 4095 && (this.progTimerMax = 4095, this.sweepCarry = !0)) : this.progTimerMax = this.progTimerMax - ((this.progTimerMax >> this.sweepShiftAmount) - (this.sqr1 ? 1 : 0)))), this.updateSweepPeriod && (this.updateSweepPeriod = !1, this.sweepCounter = this.sweepCounterMax + 1)
    },
    updateSampleValue: function() {
        this.sampleValue = this.isEnabled && this.lengthCounter > 0 && this.progTimerMax > 7 ? 0 === this.sweepMode && this.progTimerMax + (this.progTimerMax >> this.sweepShiftAmount) > 4095 ? 0 : this.masterVolume * this.dutyLookup[(this.dutyMode << 3) + this.squareCounter] : 0
    },
    writeReg: function(a, b) {
        var c = this.sqr1 ? 0 : 4;
        a === 16384 + c ? (this.envDecayDisable = 0 !== (16 & b), this.envDecayRate = 15 & b, this.envDecayLoopEnable = 0 !== (32 & b), this.dutyMode = b >> 6 & 3, this.lengthCounterEnable = 0 === (32 & b), this.masterVolume = this.envDecayDisable ? this.envDecayRate : this.envVolume, this.updateSampleValue()) : a === 16385 + c ? (this.sweepActive = 0 !== (128 & b), this.sweepCounterMax = b >> 4 & 7, this.sweepMode = b >> 3 & 1, this.sweepShiftAmount = 7 & b, this.updateSweepPeriod = !0) : a === 16386 + c ? (this.progTimerMax &= 1792, this.progTimerMax |= b) : a === 16387 + c && (this.progTimerMax &= 255, this.progTimerMax |= (7 & b) << 8, this.isEnabled && (this.lengthCounter = this.papu.getLengthMax(248 & b)), this.envReset = !0)
    },
    setEnabled: function(a) {
        this.isEnabled = a, a || (this.lengthCounter = 0), this.updateSampleValue()
    },
    getLengthStatus: function() {
        return 0 !== this.lengthCounter && this.isEnabled ? 1 : 0
    }
}, JSNES.PAPU.ChannelTriangle = function(a) {
    this.papu = a, this.isEnabled = null, this.sampleCondition = null, this.lengthCounterEnable = null, this.lcHalt = null, this.lcControl = null, this.progTimerCount = null, this.progTimerMax = null, this.triangleCounter = null, this.lengthCounter = null, this.linearCounter = null, this.lcLoadValue = null, this.sampleValue = null, this.tmp = null, this.reset()
}, JSNES.PAPU.ChannelTriangle.prototype = {
    reset: function() {
        this.progTimerCount = 0, this.progTimerMax = 0, this.triangleCounter = 0, this.isEnabled = !1, this.sampleCondition = !1, this.lengthCounter = 0, this.lengthCounterEnable = !1, this.linearCounter = 0, this.lcLoadValue = 0, this.lcHalt = !0, this.lcControl = !1, this.tmp = 0, this.sampleValue = 15
    },
    clockLengthCounter: function() {
        this.lengthCounterEnable && this.lengthCounter > 0 && (this.lengthCounter--, 0 === this.lengthCounter && this.updateSampleCondition())
    },
    clockLinearCounter: function() {
        this.lcHalt ? (this.linearCounter = this.lcLoadValue, this.updateSampleCondition()) : this.linearCounter > 0 && (this.linearCounter--, this.updateSampleCondition()), this.lcControl || (this.lcHalt = !1)
    },
    getLengthStatus: function() {
        return 0 !== this.lengthCounter && this.isEnabled ? 1 : 0
    },
    readReg: function() {
        return 0
    },
    writeReg: function(a, b) {
        16392 === a ? (this.lcControl = 0 !== (128 & b), this.lcLoadValue = 127 & b, this.lengthCounterEnable = !this.lcControl) : 16394 === a ? (this.progTimerMax &= 1792, this.progTimerMax |= b) : 16395 === a && (this.progTimerMax &= 255, this.progTimerMax |= (7 & b) << 8, this.lengthCounter = this.papu.getLengthMax(248 & b), this.lcHalt = !0), this.updateSampleCondition()
    },
    clockProgrammableTimer: function(a) {
        if (this.progTimerMax > 0)
            for (this.progTimerCount += a; this.progTimerMax > 0 && this.progTimerCount >= this.progTimerMax;) this.progTimerCount -= this.progTimerMax, this.isEnabled && this.lengthCounter > 0 && this.linearCounter > 0 && this.clockTriangleGenerator()
    },
    clockTriangleGenerator: function() {
        this.triangleCounter++, this.triangleCounter &= 31
    },
    setEnabled: function(a) {
        this.isEnabled = a, a || (this.lengthCounter = 0), this.updateSampleCondition()
    },
    updateSampleCondition: function() {
        this.sampleCondition = this.isEnabled && this.progTimerMax > 7 && this.linearCounter > 0 && this.lengthCounter > 0
    }
}, JSNES.PPU = function(a) {
    this.nes = a, this.vramMem = null, this.spriteMem = null, this.vramAddress = null, this.vramTmpAddress = null, this.vramBufferedReadValue = null, this.firstWrite = null, this.sramAddress = null, this.currentMirroring = null, this.requestEndFrame = null, this.nmiOk = null, this.dummyCycleToggle = null, this.validTileData = null, this.nmiCounter = null, this.scanlineAlreadyRendered = null, this.f_nmiOnVblank = null, this.f_spriteSize = null, this.f_bgPatternTable = null, this.f_spPatternTable = null, this.f_addrInc = null, this.f_nTblAddress = null, this.f_color = null, this.f_spVisibility = null, this.f_bgVisibility = null, this.f_spClipping = null, this.f_bgClipping = null, this.f_dispType = null, this.cntFV = null, this.cntV = null, this.cntH = null, this.cntVT = null, this.cntHT = null, this.regFV = null, this.regV = null, this.regH = null, this.regVT = null, this.regHT = null, this.regFH = null, this.regS = null, this.curNt = null, this.attrib = null, this.buffer = null, this.prevBuffer = null, this.bgbuffer = null, this.pixrendered = null, this.validTileData = null, this.scantile = null, this.scanline = null, this.lastRenderedScanline = null, this.curX = null, this.sprX = null, this.sprY = null, this.sprTile = null, this.sprCol = null, this.vertFlip = null, this.horiFlip = null, this.bgPriority = null, this.spr0HitX = null, this.spr0HitY = null, this.hitSpr0 = null, this.sprPalette = null, this.imgPalette = null, this.ptTile = null, this.ntable1 = null, this.currentMirroring = null, this.nameTable = null, this.vramMirrorTable = null, this.palTable = null, this.showSpr0Hit = !1, this.clipToTvSize = !0, this.reset()
}, JSNES.PPU.prototype = {
    STATUS_VRAMWRITE: 4,
    STATUS_SLSPRITECOUNT: 5,
    STATUS_SPRITE0HIT: 6,
    STATUS_VBLANK: 7,
    reset: function() {
        var a;
        for (this.vramMem = new Array(32768), this.spriteMem = new Array(256), a = 0; a < this.vramMem.length; a++) this.vramMem[a] = 0;
        for (a = 0; a < this.spriteMem.length; a++) this.spriteMem[a] = 0;
        for (this.vramAddress = null, this.vramTmpAddress = null, this.vramBufferedReadValue = 0, this.firstWrite = !0, this.sramAddress = 0, this.currentMirroring = -1, this.requestEndFrame = !1, this.nmiOk = !1, this.dummyCycleToggle = !1, this.validTileData = !1, this.nmiCounter = 0, this.scanlineAlreadyRendered = null, this.f_nmiOnVblank = 0, this.f_spriteSize = 0, this.f_bgPatternTable = 0, this.f_spPatternTable = 0, this.f_addrInc = 0, this.f_nTblAddress = 0, this.f_color = 0, this.f_spVisibility = 0, this.f_bgVisibility = 0, this.f_spClipping = 0, this.f_bgClipping = 0, this.f_dispType = 0, this.cntFV = 0, this.cntV = 0, this.cntH = 0, this.cntVT = 0, this.cntHT = 0, this.regFV = 0, this.regV = 0, this.regH = 0, this.regVT = 0, this.regHT = 0, this.regFH = 0, this.regS = 0, this.curNt = null, this.attrib = new Array(32), this.buffer = new Array(61440), this.prevBuffer = new Array(61440), this.bgbuffer = new Array(61440), this.pixrendered = new Array(61440), this.validTileData = null, this.scantile = new Array(32), this.scanline = 0, this.lastRenderedScanline = -1, this.curX = 0, this.sprX = new Array(64), this.sprY = new Array(64), this.sprTile = new Array(64), this.sprCol = new Array(64), this.vertFlip = new Array(64), this.horiFlip = new Array(64), this.bgPriority = new Array(64), this.spr0HitX = 0, this.spr0HitY = 0, this.hitSpr0 = !1, this.sprPalette = new Array(16), this.imgPalette = new Array(16), this.ptTile = new Array(512), a = 0; 512 > a; a++) this.ptTile[a] = new JSNES.PPU.Tile;
        for (this.ntable1 = new Array(4), this.currentMirroring = -1, this.nameTable = new Array(4), a = 0; 4 > a; a++) this.nameTable[a] = new JSNES.PPU.NameTable(32, 32, "Nt" + a);
        for (this.vramMirrorTable = new Array(32768), a = 0; 32768 > a; a++) this.vramMirrorTable[a] = a;
        this.palTable = new JSNES.PPU.PaletteTable, this.palTable.loadNTSCPalette(), this.updateControlReg1(0), this.updateControlReg2(0)
    },
    setMirroring: function(a) {
        if (a != this.currentMirroring) {
            this.currentMirroring = a, this.triggerRendering(), null === this.vramMirrorTable && (this.vramMirrorTable = new Array(32768));
            for (var b = 0; 32768 > b; b++) this.vramMirrorTable[b] = b;
            this.defineMirrorRegion(16160, 16128, 32), this.defineMirrorRegion(16192, 16128, 32), this.defineMirrorRegion(16256, 16128, 32), this.defineMirrorRegion(16320, 16128, 32), this.defineMirrorRegion(12288, 8192, 3840), this.defineMirrorRegion(16384, 0, 16384), a == this.nes.rom.HORIZONTAL_MIRRORING ? (this.ntable1[0] = 0, this.ntable1[1] = 0, this.ntable1[2] = 1, this.ntable1[3] = 1, this.defineMirrorRegion(9216, 8192, 1024), this.defineMirrorRegion(11264, 10240, 1024)) : a == this.nes.rom.VERTICAL_MIRRORING ? (this.ntable1[0] = 0, this.ntable1[1] = 1, this.ntable1[2] = 0, this.ntable1[3] = 1, this.defineMirrorRegion(10240, 8192, 1024), this.defineMirrorRegion(11264, 9216, 1024)) : a == this.nes.rom.SINGLESCREEN_MIRRORING ? (this.ntable1[0] = 0, this.ntable1[1] = 0, this.ntable1[2] = 0, this.ntable1[3] = 0, this.defineMirrorRegion(9216, 8192, 1024), this.defineMirrorRegion(10240, 8192, 1024), this.defineMirrorRegion(11264, 8192, 1024)) : a == this.nes.rom.SINGLESCREEN_MIRRORING2 ? (this.ntable1[0] = 1, this.ntable1[1] = 1, this.ntable1[2] = 1, this.ntable1[3] = 1, this.defineMirrorRegion(9216, 9216, 1024), this.defineMirrorRegion(10240, 9216, 1024), this.defineMirrorRegion(11264, 9216, 1024)) : (this.ntable1[0] = 0, this.ntable1[1] = 1, this.ntable1[2] = 2, this.ntable1[3] = 3)
        }
    },
    defineMirrorRegion: function(a, b, c) {
        for (var d = 0; c > d; d++) this.vramMirrorTable[a + d] = b + d
    },
    startVBlank: function() {
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NMI), this.lastRenderedScanline < 239 && this.renderFramePartially(this.lastRenderedScanline + 1, 240 - this.lastRenderedScanline), this.endFrame(), this.lastRenderedScanline = -1
    },
    endScanline: function() {
        switch (this.scanline) {
            case 19:
                this.dummyCycleToggle && (this.curX = 1, this.dummyCycleToggle = !this.dummyCycleToggle);
                break;
            case 20:
                this.setStatusFlag(this.STATUS_VBLANK, !1), this.setStatusFlag(this.STATUS_SPRITE0HIT, !1), this.hitSpr0 = !1, this.spr0HitX = -1, this.spr0HitY = -1, (1 == this.f_bgVisibility || 1 == this.f_spVisibility) && (this.cntFV = this.regFV, this.cntV = this.regV, this.cntH = this.regH, this.cntVT = this.regVT, this.cntHT = this.regHT, 1 == this.f_bgVisibility && this.renderBgScanline(!1, 0)), 1 == this.f_bgVisibility && 1 == this.f_spVisibility && this.checkSprite0(0), (1 == this.f_bgVisibility || 1 == this.f_spVisibility) && this.nes.mmap.clockIrqCounter();
                break;
            case 261:
                this.setStatusFlag(this.STATUS_VBLANK, !0), this.requestEndFrame = !0, this.nmiCounter = 9, this.scanline = -1;
                break;
            default:
                this.scanline >= 21 && this.scanline <= 260 && (1 == this.f_bgVisibility && (this.scanlineAlreadyRendered || (this.cntHT = this.regHT, this.cntH = this.regH, this.renderBgScanline(!0, this.scanline + 1 - 21)), this.scanlineAlreadyRendered = !1, this.hitSpr0 || 1 != this.f_spVisibility || this.sprX[0] >= -7 && this.sprX[0] < 256 && this.sprY[0] + 1 <= this.scanline - 20 && this.sprY[0] + 1 + (0 === this.f_spriteSize ? 8 : 16) >= this.scanline - 20 && this.checkSprite0(this.scanline - 20) && (this.hitSpr0 = !0)), (1 == this.f_bgVisibility || 1 == this.f_spVisibility) && this.nes.mmap.clockIrqCounter())
        }
        this.scanline++, this.regsToAddress(), this.cntsToAddress()
    },
    startFrame: function() {
        var a = 0;
        if (0 === this.f_dispType) a = this.imgPalette[0];
        else switch (this.f_color) {
            case 0:
                a = 0;
                break;
            case 1:
                a = 65280;
                break;
            case 2:
                a = 16711680;
                break;
            case 3:
                a = 0;
                break;
            case 4:
                a = 255;
                break;
            default:
                a = 0
        }
        var b, c = this.buffer;
        for (b = 0; 61440 > b; b++) c[b] = a;
        var d = this.pixrendered;
        for (b = 0; b < d.length; b++) d[b] = 65
    },
    endFrame: function() {
        var a, b, c, d = this.buffer;
        if (this.showSpr0Hit) {
            if (this.sprX[0] >= 0 && this.sprX[0] < 256 && this.sprY[0] >= 0 && this.sprY[0] < 240) {
                for (a = 0; 256 > a; a++) d[(this.sprY[0] << 8) + a] = 16733525;
                for (a = 0; 240 > a; a++) d[(a << 8) + this.sprX[0]] = 16733525
            }
            if (this.spr0HitX >= 0 && this.spr0HitX < 256 && this.spr0HitY >= 0 && this.spr0HitY < 240) {
                for (a = 0; 256 > a; a++) d[(this.spr0HitY << 8) + a] = 5635925;
                for (a = 0; 240 > a; a++) d[(a << 8) + this.spr0HitX] = 5635925
            }
        }
        if (this.clipToTvSize || 0 === this.f_bgClipping || 0 === this.f_spClipping)
            for (c = 0; 240 > c; c++)
                for (b = 0; 8 > b; b++) d[(c << 8) + b] = 0;
        if (this.clipToTvSize)
            for (c = 0; 240 > c; c++)
                for (b = 0; 8 > b; b++) d[(c << 8) + 255 - b] = 0;
        if (this.clipToTvSize)
            for (c = 0; 8 > c; c++)
                for (b = 0; 256 > b; b++) d[(c << 8) + b] = 0, d[(239 - c << 8) + b] = 0;
        this.nes.opts.showDisplay && this.nes.ui.writeFrame(d, this.prevBuffer)
    },
    updateControlReg1: function(a) {
        this.triggerRendering(), this.f_nmiOnVblank = a >> 7 & 1, this.f_spriteSize = a >> 5 & 1, this.f_bgPatternTable = a >> 4 & 1, this.f_spPatternTable = a >> 3 & 1, this.f_addrInc = a >> 2 & 1, this.f_nTblAddress = 3 & a, this.regV = a >> 1 & 1, this.regH = 1 & a, this.regS = a >> 4 & 1
    },
    updateControlReg2: function(a) {
        this.triggerRendering(), this.f_color = a >> 5 & 7, this.f_spVisibility = a >> 4 & 1, this.f_bgVisibility = a >> 3 & 1, this.f_spClipping = a >> 2 & 1, this.f_bgClipping = a >> 1 & 1, this.f_dispType = 1 & a, 0 === this.f_dispType && this.palTable.setEmphasis(this.f_color), this.updatePalettes()
    },
    setStatusFlag: function(a, b) {
        var c = 1 << a;
        this.nes.cpu.mem[8194] = this.nes.cpu.mem[8194] & 255 - c | (b ? c : 0)
    },
    readStatusRegister: function() {
        var a = this.nes.cpu.mem[8194];
        return this.firstWrite = !0, this.setStatusFlag(this.STATUS_VBLANK, !1), a
    },
    writeSRAMAddress: function(a) {
        this.sramAddress = a
    },
    sramLoad: function() {
        return this.spriteMem[this.sramAddress]
    },
    sramWrite: function(a) {
        this.spriteMem[this.sramAddress] = a, this.spriteRamWriteUpdate(this.sramAddress, a), this.sramAddress++, this.sramAddress %= 256
    },
    scrollWrite: function(a) {
        this.triggerRendering(), this.firstWrite ? (this.regHT = a >> 3 & 31, this.regFH = 7 & a) : (this.regFV = 7 & a, this.regVT = a >> 3 & 31), this.firstWrite = !this.firstWrite
    },
    writeVRAMAddress: function(a) {
        this.firstWrite ? (this.regFV = a >> 4 & 3, this.regV = a >> 3 & 1, this.regH = a >> 2 & 1, this.regVT = 7 & this.regVT | (3 & a) << 3) : (this.triggerRendering(), this.regVT = 24 & this.regVT | a >> 5 & 7, this.regHT = 31 & a, this.cntFV = this.regFV, this.cntV = this.regV, this.cntH = this.regH, this.cntVT = this.regVT, this.cntHT = this.regHT, this.checkSprite0(this.scanline - 20)), this.firstWrite = !this.firstWrite, this.cntsToAddress(), this.vramAddress < 8192 && this.nes.mmap.latchAccess(this.vramAddress)
    },
    vramLoad: function() {
        var a;
        return this.cntsToAddress(), this.regsToAddress(), this.vramAddress <= 16127 ? (a = this.vramBufferedReadValue, this.vramBufferedReadValue = this.vramAddress < 8192 ? this.vramMem[this.vramAddress] : this.mirroredLoad(this.vramAddress), this.vramAddress < 8192 && this.nes.mmap.latchAccess(this.vramAddress), this.vramAddress += 1 == this.f_addrInc ? 32 : 1, this.cntsFromAddress(), this.regsFromAddress(), a) : (a = this.mirroredLoad(this.vramAddress), this.vramAddress += 1 == this.f_addrInc ? 32 : 1, this.cntsFromAddress(), this.regsFromAddress(), a)
    },
    vramWrite: function(a) {
        this.triggerRendering(), this.cntsToAddress(), this.regsToAddress(), this.vramAddress >= 8192 ? this.mirroredWrite(this.vramAddress, a) : (this.writeMem(this.vramAddress, a), this.nes.mmap.latchAccess(this.vramAddress)), this.vramAddress += 1 == this.f_addrInc ? 32 : 1, this.regsFromAddress(), this.cntsFromAddress()
    },
    sramDMA: function(a) {
        for (var b, c = 256 * a, d = this.sramAddress; 256 > d; d++) b = this.nes.cpu.mem[c + d], this.spriteMem[d] = b, this.spriteRamWriteUpdate(d, b);
        this.nes.cpu.haltCycles(513)
    },
    regsFromAddress: function() {
        var a = this.vramTmpAddress >> 8 & 255;
        this.regFV = a >> 4 & 7, this.regV = a >> 3 & 1, this.regH = a >> 2 & 1, this.regVT = 7 & this.regVT | (3 & a) << 3, a = 255 & this.vramTmpAddress, this.regVT = 24 & this.regVT | a >> 5 & 7, this.regHT = 31 & a
    },
    cntsFromAddress: function() {
        var a = this.vramAddress >> 8 & 255;
        this.cntFV = a >> 4 & 3, this.cntV = a >> 3 & 1, this.cntH = a >> 2 & 1, this.cntVT = 7 & this.cntVT | (3 & a) << 3, a = 255 & this.vramAddress, this.cntVT = 24 & this.cntVT | a >> 5 & 7, this.cntHT = 31 & a
    },
    regsToAddress: function() {
        var a = (7 & this.regFV) << 4;
        a |= (1 & this.regV) << 3, a |= (1 & this.regH) << 2, a |= this.regVT >> 3 & 3;
        var b = (7 & this.regVT) << 5;
        b |= 31 & this.regHT, this.vramTmpAddress = 32767 & (a << 8 | b)
    },
    cntsToAddress: function() {
        var a = (7 & this.cntFV) << 4;
        a |= (1 & this.cntV) << 3, a |= (1 & this.cntH) << 2, a |= this.cntVT >> 3 & 3;
        var b = (7 & this.cntVT) << 5;
        b |= 31 & this.cntHT, this.vramAddress = 32767 & (a << 8 | b)
    },
    incTileCounter: function(a) {
        for (var b = a; 0 !== b; b--) this.cntHT++, 32 == this.cntHT && (this.cntHT = 0, this.cntVT++, this.cntVT >= 30 && (this.cntH++, 2 == this.cntH && (this.cntH = 0, this.cntV++, 2 == this.cntV && (this.cntV = 0, this.cntFV++, this.cntFV &= 7))))
    },
    mirroredLoad: function(a) {
        return this.vramMem[this.vramMirrorTable[a]]
    },
    mirroredWrite: function(a, b) {
        a >= 16128 && 16160 > a ? 16128 == a || 16144 == a ? (this.writeMem(16128, b), this.writeMem(16144, b)) : 16132 == a || 16148 == a ? (this.writeMem(16132, b), this.writeMem(16148, b)) : 16136 == a || 16152 == a ? (this.writeMem(16136, b), this.writeMem(16152, b)) : 16140 == a || 16156 == a ? (this.writeMem(16140, b), this.writeMem(16156, b)) : this.writeMem(a, b) : a < this.vramMirrorTable.length ? this.writeMem(this.vramMirrorTable[a], b) : alert("Invalid VRAM address: " + a.toString(16))
    },
    triggerRendering: function() {
        this.scanline >= 21 && this.scanline <= 260 && (this.renderFramePartially(this.lastRenderedScanline + 1, this.scanline - 21 - this.lastRenderedScanline), this.lastRenderedScanline = this.scanline - 21)
    },
    renderFramePartially: function(a, b) {
        if (1 == this.f_spVisibility && this.renderSpritesPartially(a, b, !0), 1 == this.f_bgVisibility) {
            var c = a << 8,
                d = a + b << 8;
            d > 61440 && (d = 61440);
            for (var e = this.buffer, f = this.bgbuffer, g = this.pixrendered, h = c; d > h; h++) g[h] > 255 && (e[h] = f[h])
        }
        1 == this.f_spVisibility && this.renderSpritesPartially(a, b, !1), this.validTileData = !1
    },
    renderBgScanline: function(a, b) {
        var c = 0 === this.regS ? 0 : 256,
            d = (b << 8) - this.regFH;
        if (this.curNt = this.ntable1[this.cntV + this.cntV + this.cntH], this.cntHT = this.regHT, this.cntH = this.regH, this.curNt = this.ntable1[this.cntV + this.cntV + this.cntH], 240 > b && b - this.cntFV >= 0) {
            for (var e, f, g, h, i = this.cntFV << 3, j = this.scantile, k = this.attrib, l = this.ptTile, m = this.nameTable, n = this.imgPalette, o = this.pixrendered, p = a ? this.bgbuffer : this.buffer, q = 0; 32 > q; q++) {
                if (b >= 0) {
                    this.validTileData ? (e = j[q], f = e.pix, g = k[q]) : (e = l[c + m[this.curNt].getTileIndex(this.cntHT, this.cntVT)], f = e.pix, g = m[this.curNt].getAttrib(this.cntHT, this.cntVT), j[q] = e, k[q] = g);
                    var r = 0,
                        s = (q << 3) - this.regFH;
                    if (s > -8)
                        if (0 > s && (d -= s, r = -s), e.opaque[this.cntFV])
                            for (; 8 > r; r++) p[d] = n[f[i + r] + g], o[d] |= 256, d++;
                        else
                            for (; 8 > r; r++) h = f[i + r], 0 !== h && (p[d] = n[h + g], o[d] |= 256), d++
                }
                32 == ++this.cntHT && (this.cntHT = 0, this.cntH++, this.cntH %= 2, this.curNt = this.ntable1[(this.cntV << 1) + this.cntH])
            }
            this.validTileData = !0
        }
        this.cntFV++, 8 == this.cntFV && (this.cntFV = 0, this.cntVT++, 30 == this.cntVT ? (this.cntVT = 0, this.cntV++, this.cntV %= 2, this.curNt = this.ntable1[(this.cntV << 1) + this.cntH]) : 32 == this.cntVT && (this.cntVT = 0), this.validTileData = !1)
    },
    renderSpritesPartially: function(a, b, c) {
        if (1 === this.f_spVisibility)
            for (var d = 0; 64 > d; d++)
                if (this.bgPriority[d] == c && this.sprX[d] >= 0 && this.sprX[d] < 256 && this.sprY[d] + 8 >= a && this.sprY[d] < a + b)
                    if (0 === this.f_spriteSize) this.srcy1 = 0, this.srcy2 = 8, this.sprY[d] < a && (this.srcy1 = a - this.sprY[d] - 1), this.sprY[d] + 8 > a + b && (this.srcy2 = a + b - this.sprY[d] + 1), 0 === this.f_spPatternTable ? this.ptTile[this.sprTile[d]].render(this.buffer, 0, this.srcy1, 8, this.srcy2, this.sprX[d], this.sprY[d] + 1, this.sprCol[d], this.sprPalette, this.horiFlip[d], this.vertFlip[d], d, this.pixrendered) : this.ptTile[this.sprTile[d] + 256].render(this.buffer, 0, this.srcy1, 8, this.srcy2, this.sprX[d], this.sprY[d] + 1, this.sprCol[d], this.sprPalette, this.horiFlip[d], this.vertFlip[d], d, this.pixrendered);
                    else {
                        var e = this.sprTile[d];
                        0 !== (1 & e) && (e = this.sprTile[d] - 1 + 256);
                        var f = 0,
                            g = 8;
                        this.sprY[d] < a && (f = a - this.sprY[d] - 1), this.sprY[d] + 8 > a + b && (g = a + b - this.sprY[d]), this.ptTile[e + (this.vertFlip[d] ? 1 : 0)].render(this.buffer, 0, f, 8, g, this.sprX[d], this.sprY[d] + 1, this.sprCol[d], this.sprPalette, this.horiFlip[d], this.vertFlip[d], d, this.pixrendered), f = 0, g = 8, this.sprY[d] + 8 < a && (f = a - (this.sprY[d] + 8 + 1)), this.sprY[d] + 16 > a + b && (g = a + b - (this.sprY[d] + 8)), this.ptTile[e + (this.vertFlip[d] ? 0 : 1)].render(this.buffer, 0, f, 8, g, this.sprX[d], this.sprY[d] + 1 + 8, this.sprCol[d], this.sprPalette, this.horiFlip[d], this.vertFlip[d], d, this.pixrendered)
                    }
    },
    checkSprite0: function(a) {
        this.spr0HitX = -1, this.spr0HitY = -1;
        var b, c, d, e, f, g, h, i, j = 0 === this.f_spPatternTable ? 0 : 256;
        if (c = this.sprX[0], d = this.sprY[0] + 1, 0 === this.f_spriteSize) {
            if (a >= d && d + 8 > a && c >= -7 && 256 > c)
                if (e = this.ptTile[this.sprTile[0] + j], h = this.sprCol[0], i = this.bgPriority[0], b = this.vertFlip[0] ? 7 - (a - d) : a - d, b *= 8, g = 256 * a + c, this.horiFlip[0])
                    for (f = 7; f >= 0; f--) {
                        if (c >= 0 && 256 > c && g >= 0 && 61440 > g && 0 !== this.pixrendered[g] && 0 !== e.pix[b + f]) return this.spr0HitX = g % 256, this.spr0HitY = a, !0;
                        c++, g++
                    } else
                        for (f = 0; 8 > f; f++) {
                            if (c >= 0 && 256 > c && g >= 0 && 61440 > g && 0 !== this.pixrendered[g] && 0 !== e.pix[b + f]) return this.spr0HitX = g % 256, this.spr0HitY = a, !0;
                            c++, g++
                        }
        } else if (a >= d && d + 16 > a && c >= -7 && 256 > c)
            if (b = this.vertFlip[0] ? 15 - (a - d) : a - d, 8 > b ? e = this.ptTile[this.sprTile[0] + (this.vertFlip[0] ? 1 : 0) + (0 !== (1 & this.sprTile[0]) ? 255 : 0)] : (e = this.ptTile[this.sprTile[0] + (this.vertFlip[0] ? 0 : 1) + (0 !== (1 & this.sprTile[0]) ? 255 : 0)], this.vertFlip[0] ? b = 15 - b : b -= 8), b *= 8, h = this.sprCol[0], i = this.bgPriority[0], g = 256 * a + c, this.horiFlip[0])
                for (f = 7; f >= 0; f--) {
                    if (c >= 0 && 256 > c && g >= 0 && 61440 > g && 0 !== this.pixrendered[g] && 0 !== e.pix[b + f]) return this.spr0HitX = g % 256, this.spr0HitY = a, !0;
                    c++, g++
                } else
                    for (f = 0; 8 > f; f++) {
                        if (c >= 0 && 256 > c && g >= 0 && 61440 > g && 0 !== this.pixrendered[g] && 0 !== e.pix[b + f]) return this.spr0HitX = g % 256, this.spr0HitY = a, !0;
                        c++, g++
                    }
            return !1
    },
    writeMem: function(a, b) {
        this.vramMem[a] = b, 8192 > a ? (this.vramMem[a] = b, this.patternWrite(a, b)) : a >= 8192 && 9152 > a ? this.nameTableWrite(this.ntable1[0], a - 8192, b) : a >= 9152 && 9216 > a ? this.attribTableWrite(this.ntable1[0], a - 9152, b) : a >= 9216 && 10176 > a ? this.nameTableWrite(this.ntable1[1], a - 9216, b) : a >= 10176 && 10240 > a ? this.attribTableWrite(this.ntable1[1], a - 10176, b) : a >= 10240 && 11200 > a ? this.nameTableWrite(this.ntable1[2], a - 10240, b) : a >= 11200 && 11264 > a ? this.attribTableWrite(this.ntable1[2], a - 11200, b) : a >= 11264 && 12224 > a ? this.nameTableWrite(this.ntable1[3], a - 11264, b) : a >= 12224 && 12288 > a ? this.attribTableWrite(this.ntable1[3], a - 12224, b) : a >= 16128 && 16160 > a && this.updatePalettes()
    },
    updatePalettes: function() {
        var a;
        for (a = 0; 16 > a; a++) this.imgPalette[a] = this.palTable.getEntry(0 === this.f_dispType ? 63 & this.vramMem[16128 + a] : 32 & this.vramMem[16128 + a]);
        for (a = 0; 16 > a; a++) this.sprPalette[a] = this.palTable.getEntry(0 === this.f_dispType ? 63 & this.vramMem[16144 + a] : 32 & this.vramMem[16144 + a])
    },
    patternWrite: function(a, b) {
        var c = Math.floor(a / 16),
            d = a % 16;
        8 > d ? this.ptTile[c].setScanline(d, b, this.vramMem[a + 8]) : this.ptTile[c].setScanline(d - 8, this.vramMem[a - 8], b)
    },
    nameTableWrite: function(a, b, c) {
        this.nameTable[a].tile[b] = c, this.checkSprite0(this.scanline - 20)
    },
    attribTableWrite: function(a, b, c) {
        this.nameTable[a].writeAttrib(b, c)
    },
    spriteRamWriteUpdate: function(a, b) {
        var c = Math.floor(a / 4);
        0 === c && this.checkSprite0(this.scanline - 20), a % 4 === 0 ? this.sprY[c] = b : a % 4 == 1 ? this.sprTile[c] = b : a % 4 == 2 ? (this.vertFlip[c] = 0 !== (128 & b), this.horiFlip[c] = 0 !== (64 & b), this.bgPriority[c] = 0 !== (32 & b), this.sprCol[c] = (3 & b) << 2) : a % 4 == 3 && (this.sprX[c] = b)
    },
    doNMI: function() {
        this.setStatusFlag(this.STATUS_VBLANK, !0), this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NMI)
    },
    JSON_PROPERTIES: ["vramMem", "spriteMem", "cntFV", "cntV", "cntH", "cntVT", "cntHT", "regFV", "regV", "regH", "regVT", "regHT", "regFH", "regS", "vramAddress", "vramTmpAddress", "f_nmiOnVblank", "f_spriteSize", "f_bgPatternTable", "f_spPatternTable", "f_addrInc", "f_nTblAddress", "f_color", "f_spVisibility", "f_bgVisibility", "f_spClipping", "f_bgClipping", "f_dispType", "vramBufferedReadValue", "firstWrite", "currentMirroring", "vramMirrorTable", "ntable1", "sramAddress", "hitSpr0", "sprPalette", "imgPalette", "curX", "scanline", "lastRenderedScanline", "curNt", "scantile", "attrib", "buffer", "bgbuffer", "pixrendered", "requestEndFrame", "nmiOk", "dummyCycleToggle", "nmiCounter", "validTileData", "scanlineAlreadyRendered"],
    toJSON: function() {
        var a, b = JSNES.Utils.toJSON(this);
        for (b.nameTable = [], a = 0; a < this.nameTable.length; a++) b.nameTable[a] = this.nameTable[a].toJSON();
        for (b.ptTile = [], a = 0; a < this.ptTile.length; a++) b.ptTile[a] = this.ptTile[a].toJSON();
        return b
    },
    fromJSON: function(a) {
        var b;
        for (JSNES.Utils.fromJSON(this, a), b = 0; b < this.nameTable.length; b++) this.nameTable[b].fromJSON(a.nameTable[b]);
        for (b = 0; b < this.ptTile.length; b++) this.ptTile[b].fromJSON(a.ptTile[b]);
        for (b = 0; b < this.spriteMem.length; b++) this.spriteRamWriteUpdate(b, this.spriteMem[b])
    }
}, JSNES.PPU.NameTable = function(a, b, c) {
    this.width = a, this.height = b, this.name = c, this.tile = new Array(a * b), this.attrib = new Array(a * b)
}, JSNES.PPU.NameTable.prototype = {
    getTileIndex: function(a, b) {
        return this.tile[b * this.width + a]
    },
    getAttrib: function(a, b) {
        return this.attrib[b * this.width + a]
    },
    writeAttrib: function(a, b) {
        for (var c, d, e, f, g = a % 8 * 4, h = 4 * Math.floor(a / 8), i = 0; 2 > i; i++)
            for (var j = 0; 2 > j; j++) {
                c = b >> 2 * (2 * i + j) & 3;
                for (var k = 0; 2 > k; k++)
                    for (var l = 0; 2 > l; l++) d = g + 2 * j + l, e = h + 2 * i + k, f = e * this.width + d, this.attrib[e * this.width + d] = c << 2 & 12
            }
    },
    toJSON: function() {
        return {
            tile: this.tile,
            attrib: this.attrib
        }
    },
    fromJSON: function(a) {
        this.tile = a.tile, this.attrib = a.attrib
    }
}, JSNES.PPU.PaletteTable = function() {
    this.curTable = new Array(64), this.emphTable = new Array(8), this.currentEmph = -1
}, JSNES.PPU.PaletteTable.prototype = {
    reset: function() {
        this.setEmphasis(0)
    },
    loadNTSCPalette: function() {
        this.curTable = [5395026, 11796480, 10485760, 11599933, 7602281, 91, 95, 6208, 12048, 543240, 26368, 1196544, 7153664, 0, 0, 0, 12899815, 16728064, 14421538, 16729963, 14090399, 6818519, 6588, 21681, 27227, 35843, 43776, 2918400, 10777088, 0, 0, 0, 16316664, 16755516, 16742785, 16735173, 16730354, 14633471, 4681215, 46327, 57599, 58229, 259115, 7911470, 15065624, 7895160, 0, 0, 16777215, 16773822, 16300216, 16300248, 16758527, 16761855, 13095423, 10148607, 8973816, 8650717, 12122296, 16119980, 16777136, 16308472, 0, 0], this.makeTables(), this.setEmphasis(0)
    },
    loadPALPalette: function() {
        this.curTable = [5395026, 11796480, 10485760, 11599933, 7602281, 91, 95, 6208, 12048, 543240, 26368, 1196544, 7153664, 0, 0, 0, 12899815, 16728064, 14421538, 16729963, 14090399, 6818519, 6588, 21681, 27227, 35843, 43776, 2918400, 10777088, 0, 0, 0, 16316664, 16755516, 16742785, 16735173, 16730354, 14633471, 4681215, 46327, 57599, 58229, 259115, 7911470, 15065624, 7895160, 0, 0, 16777215, 16773822, 16300216, 16300248, 16758527, 16761855, 13095423, 10148607, 8973816, 8650717, 12122296, 16119980, 16777136, 16308472, 0, 0], this.makeTables(), this.setEmphasis(0)
    },
    makeTables: function() {
        for (var a, b, c, d, e, f, g, h, i = 0; 8 > i; i++)
            for (f = 1, g = 1, h = 1, 0 !== (1 & i) && (f = .75, h = .75), 0 !== (2 & i) && (f = .75, g = .75), 0 !== (4 & i) && (g = .75, h = .75), this.emphTable[i] = new Array(64), e = 0; 64 > e; e++) d = this.curTable[e], a = Math.floor(this.getRed(d) * f), b = Math.floor(this.getGreen(d) * g), c = Math.floor(this.getBlue(d) * h), this.emphTable[i][e] = this.getRgb(a, b, c)
    },
    setEmphasis: function(a) {
        if (a != this.currentEmph) {
            this.currentEmph = a;
            for (var b = 0; 64 > b; b++) this.curTable[b] = this.emphTable[a][b]
        }
    },
    getEntry: function(a) {
        return this.curTable[a]
    },
    getRed: function(a) {
        return a >> 16 & 255
    },
    getGreen: function(a) {
        return a >> 8 & 255
    },
    getBlue: function(a) {
        return 255 & a
    },
    getRgb: function(a, b, c) {
        return a << 16 | b << 8 | c
    },
    loadDefaultPalette: function() {
        this.curTable[0] = this.getRgb(117, 117, 117), this.curTable[1] = this.getRgb(39, 27, 143), this.curTable[2] = this.getRgb(0, 0, 171), this.curTable[3] = this.getRgb(71, 0, 159), this.curTable[4] = this.getRgb(143, 0, 119), this.curTable[5] = this.getRgb(171, 0, 19), this.curTable[6] = this.getRgb(167, 0, 0), this.curTable[7] = this.getRgb(127, 11, 0), this.curTable[8] = this.getRgb(67, 47, 0), this.curTable[9] = this.getRgb(0, 71, 0), this.curTable[10] = this.getRgb(0, 81, 0), this.curTable[11] = this.getRgb(0, 63, 23), this.curTable[12] = this.getRgb(27, 63, 95), this.curTable[13] = this.getRgb(0, 0, 0), this.curTable[14] = this.getRgb(0, 0, 0), this.curTable[15] = this.getRgb(0, 0, 0), this.curTable[16] = this.getRgb(188, 188, 188), this.curTable[17] = this.getRgb(0, 115, 239), this.curTable[18] = this.getRgb(35, 59, 239), this.curTable[19] = this.getRgb(131, 0, 243), this.curTable[20] = this.getRgb(191, 0, 191), this.curTable[21] = this.getRgb(231, 0, 91), this.curTable[22] = this.getRgb(219, 43, 0), this.curTable[23] = this.getRgb(203, 79, 15), this.curTable[24] = this.getRgb(139, 115, 0), this.curTable[25] = this.getRgb(0, 151, 0), this.curTable[26] = this.getRgb(0, 171, 0), this.curTable[27] = this.getRgb(0, 147, 59), this.curTable[28] = this.getRgb(0, 131, 139), this.curTable[29] = this.getRgb(0, 0, 0), this.curTable[30] = this.getRgb(0, 0, 0), this.curTable[31] = this.getRgb(0, 0, 0), this.curTable[32] = this.getRgb(255, 255, 255), this.curTable[33] = this.getRgb(63, 191, 255), this.curTable[34] = this.getRgb(95, 151, 255), this.curTable[35] = this.getRgb(167, 139, 253), this.curTable[36] = this.getRgb(247, 123, 255), this.curTable[37] = this.getRgb(255, 119, 183), this.curTable[38] = this.getRgb(255, 119, 99), this.curTable[39] = this.getRgb(255, 155, 59), this.curTable[40] = this.getRgb(243, 191, 63), this.curTable[41] = this.getRgb(131, 211, 19), this.curTable[42] = this.getRgb(79, 223, 75), this.curTable[43] = this.getRgb(88, 248, 152), this.curTable[44] = this.getRgb(0, 235, 219), this.curTable[45] = this.getRgb(0, 0, 0), this.curTable[46] = this.getRgb(0, 0, 0), this.curTable[47] = this.getRgb(0, 0, 0), this.curTable[48] = this.getRgb(255, 255, 255), this.curTable[49] = this.getRgb(171, 231, 255), this.curTable[50] = this.getRgb(199, 215, 255), this.curTable[51] = this.getRgb(215, 203, 255), this.curTable[52] = this.getRgb(255, 199, 255), this.curTable[53] = this.getRgb(255, 199, 219), this.curTable[54] = this.getRgb(255, 191, 179), this.curTable[55] = this.getRgb(255, 219, 171), this.curTable[56] = this.getRgb(255, 231, 163), this.curTable[57] = this.getRgb(227, 255, 163), this.curTable[58] = this.getRgb(171, 243, 191), this.curTable[59] = this.getRgb(179, 255, 207), this.curTable[60] = this.getRgb(159, 255, 243), this.curTable[61] = this.getRgb(0, 0, 0), this.curTable[62] = this.getRgb(0, 0, 0), this.curTable[63] = this.getRgb(0, 0, 0), this.makeTables(), this.setEmphasis(0)
    }
}, JSNES.PPU.Tile = function() {
    this.pix = new Array(64), this.fbIndex = null, this.tIndex = null, this.x = null, this.y = null, this.w = null, this.h = null, this.incX = null, this.incY = null, this.palIndex = null, this.tpri = null, this.c = null, this.initialized = !1, this.opaque = new Array(8)
}, JSNES.PPU.Tile.prototype = {
    setBuffer: function(a) {
        for (this.y = 0; this.y < 8; this.y++) this.setScanline(this.y, a[this.y], a[this.y + 8])
    },
    setScanline: function(a, b, c) {
        for (this.initialized = !0, this.tIndex = a << 3, this.x = 0; this.x < 8; this.x++) this.pix[this.tIndex + this.x] = (b >> 7 - this.x & 1) + ((c >> 7 - this.x & 1) << 1), 0 === this.pix[this.tIndex + this.x] && (this.opaque[a] = !1)
    },
    render: function(a, b, c, d, e, f, g, h, i, j, k, l, m) {
        if (!(-7 > f || f >= 256 || -7 > g || g >= 240))
            if (this.w = d - b, this.h = e - c, 0 > f && (b -= f), f + d >= 256 && (d = 256 - f), 0 > g && (c -= g), g + e >= 240 && (e = 240 - g), j || k)
                if (j && !k)
                    for (this.fbIndex = (g << 8) + f, this.tIndex = 7, this.y = 0; this.y < 8; this.y++) {
                        for (this.x = 0; this.x < 8; this.x++) this.x >= b && this.x < d && this.y >= c && this.y < e && (this.palIndex = this.pix[this.tIndex], this.tpri = m[this.fbIndex], 0 !== this.palIndex && l <= (255 & this.tpri) && (a[this.fbIndex] = i[this.palIndex + h], this.tpri = 3840 & this.tpri | l, m[this.fbIndex] = this.tpri)), this.fbIndex++, this.tIndex--;
                        this.fbIndex -= 8, this.fbIndex += 256, this.tIndex += 16
                    } else if (k && !j)
                        for (this.fbIndex = (g << 8) + f, this.tIndex = 56, this.y = 0; this.y < 8; this.y++) {
                            for (this.x = 0; this.x < 8; this.x++) this.x >= b && this.x < d && this.y >= c && this.y < e && (this.palIndex = this.pix[this.tIndex], this.tpri = m[this.fbIndex], 0 !== this.palIndex && l <= (255 & this.tpri) && (a[this.fbIndex] = i[this.palIndex + h], this.tpri = 3840 & this.tpri | l, m[this.fbIndex] = this.tpri)), this.fbIndex++, this.tIndex++;
                            this.fbIndex -= 8, this.fbIndex += 256, this.tIndex -= 16
                        } else
                            for (this.fbIndex = (g << 8) + f, this.tIndex = 63, this.y = 0; this.y < 8; this.y++) {
                                for (this.x = 0; this.x < 8; this.x++) this.x >= b && this.x < d && this.y >= c && this.y < e && (this.palIndex = this.pix[this.tIndex], this.tpri = m[this.fbIndex], 0 !== this.palIndex && l <= (255 & this.tpri) && (a[this.fbIndex] = i[this.palIndex + h], this.tpri = 3840 & this.tpri | l, m[this.fbIndex] = this.tpri)), this.fbIndex++, this.tIndex--;
                                this.fbIndex -= 8, this.fbIndex += 256
                            } else
                                for (this.fbIndex = (g << 8) + f, this.tIndex = 0, this.y = 0; this.y < 8; this.y++) {
                                    for (this.x = 0; this.x < 8; this.x++) this.x >= b && this.x < d && this.y >= c && this.y < e && (this.palIndex = this.pix[this.tIndex], this.tpri = m[this.fbIndex], 0 !== this.palIndex && l <= (255 & this.tpri) && (a[this.fbIndex] = i[this.palIndex + h], this.tpri = 3840 & this.tpri | l, m[this.fbIndex] = this.tpri)), this.fbIndex++, this.tIndex++;
                                    this.fbIndex -= 8, this.fbIndex += 256
                                }
    },
    isTransparent: function(a, b) {
        return 0 === this.pix[(b << 3) + a]
    },
    toJSON: function() {
        return {
            opaque: this.opaque,
            pix: this.pix
        }
    },
    fromJSON: function(a) {
        this.opaque = a.opaque, this.pix = a.pix
    }
}, JSNES.ROM = function(a) {
    this.nes = a, this.mapperName = new Array(92);
    for (var b = 0; 92 > b; b++) this.mapperName[b] = "Unknown Mapper";
    this.mapperName[0] = "Direct Access", this.mapperName[1] = "Nintendo MMC1", this.mapperName[2] = "UNROM", this.mapperName[3] = "CNROM", this.mapperName[4] = "Nintendo MMC3", this.mapperName[5] = "Nintendo MMC5", this.mapperName[6] = "FFE F4xxx", this.mapperName[7] = "AOROM", this.mapperName[8] = "FFE F3xxx", this.mapperName[9] = "Nintendo MMC2", this.mapperName[10] = "Nintendo MMC4", this.mapperName[11] = "Color Dreams Chip", this.mapperName[12] = "FFE F6xxx", this.mapperName[15] = "100-in-1 switch", this.mapperName[16] = "Bandai chip", this.mapperName[17] = "FFE F8xxx", this.mapperName[18] = "Jaleco SS8806 chip", this.mapperName[19] = "Namcot 106 chip", this.mapperName[20] = "Famicom Disk System", this.mapperName[21] = "Konami VRC4a", this.mapperName[22] = "Konami VRC2a", this.mapperName[23] = "Konami VRC2a", this.mapperName[24] = "Konami VRC6", this.mapperName[25] = "Konami VRC4b", this.mapperName[32] = "Irem G-101 chip", this.mapperName[33] = "Taito TC0190/TC0350", this.mapperName[34] = "32kB ROM switch", this.mapperName[64] = "Tengen RAMBO-1 chip", this.mapperName[65] = "Irem H-3001 chip", this.mapperName[66] = "GNROM switch", this.mapperName[67] = "SunSoft3 chip", this.mapperName[68] = "SunSoft4 chip", this.mapperName[69] = "SunSoft5 FME-7 chip", this.mapperName[71] = "Camerica chip", this.mapperName[78] = "Irem 74HC161/32-based", this.mapperName[91] = "Pirate HK-SF3 chip"
}, JSNES.ROM.prototype = {
    VERTICAL_MIRRORING: 0,
    HORIZONTAL_MIRRORING: 1,
    FOURSCREEN_MIRRORING: 2,
    SINGLESCREEN_MIRRORING: 3,
    SINGLESCREEN_MIRRORING2: 4,
    SINGLESCREEN_MIRRORING3: 5,
    SINGLESCREEN_MIRRORING4: 6,
    CHRROM_MIRRORING: 7,
    header: null,
    rom: null,
    vrom: null,
    vromTile: null,
    romCount: null,
    vromCount: null,
    mirroring: null,
    batteryRam: null,
    trainer: null,
    fourScreen: null,
    mapperType: null,
    valid: !1,
    load: function(a) {
        var b, c, d;
        if(a == null) return void this.nes.ui.updateStatus("Error a is null");
        if (-1 === a.indexOf("NES")) return void this.nes.ui.updateStatus("Not a valid NES ROM.");
        for (this.header = new Array(16), b = 0; 16 > b; b++) this.header[b] = 255 & a.charCodeAt(b);
        this.romCount = this.header[4], this.vromCount = 2 * this.header[5], this.mirroring = 0 !== (1 & this.header[6]) ? 1 : 0, this.batteryRam = 0 !== (2 & this.header[6]), this.trainer = 0 !== (4 & this.header[6]), this.fourScreen = 0 !== (8 & this.header[6]), this.mapperType = this.header[6] >> 4 | 240 & this.header[7];
        var e = !1;
        for (b = 8; 16 > b; b++)
            if (0 !== this.header[b]) {
                e = !0;
                break
            }
        e && (this.mapperType &= 15), this.rom = new Array(this.romCount);
        var f = 16;
        for (b = 0; b < this.romCount; b++) {
            for (this.rom[b] = new Array(16384), c = 0; 16384 > c && !(f + c >= a.length); c++) this.rom[b][c] = 255 & a.charCodeAt(f + c);
            f += 16384
        }
        for (this.vrom = new Array(this.vromCount), b = 0; b < this.vromCount; b++) {
            for (this.vrom[b] = new Array(4096), c = 0; 4096 > c && !(f + c >= a.length); c++) this.vrom[b][c] = 255 & a.charCodeAt(f + c);
            f += 4096
        }
        for (this.vromTile = new Array(this.vromCount), b = 0; b < this.vromCount; b++)
            for (this.vromTile[b] = new Array(256), c = 0; 256 > c; c++) this.vromTile[b][c] = new JSNES.PPU.Tile;
        var g, h;
        for (d = 0; d < this.vromCount; d++)
            for (b = 0; 4096 > b; b++) g = b >> 4, h = b % 16, 8 > h ? this.vromTile[d][g].setScanline(h, this.vrom[d][b], this.vrom[d][b + 8]) : this.vromTile[d][g].setScanline(h - 8, this.vrom[d][b - 8], this.vrom[d][b]);
        this.valid = !0
    },
    getMirroringType: function() {
        return this.fourScreen ? this.FOURSCREEN_MIRRORING : 0 === this.mirroring ? this.HORIZONTAL_MIRRORING : this.VERTICAL_MIRRORING
    },
    getMapperName: function() {
        return this.mapperType >= 0 && this.mapperType < this.mapperName.length ? this.mapperName[this.mapperType] : "Unknown Mapper, " + this.mapperType
    },
    mapperSupported: function() {
        return "undefined" != typeof JSNES.Mappers[this.mapperType]
    },
    createMapper: function() {
        return this.mapperSupported() ? new JSNES.Mappers[this.mapperType](this.nes) : (this.nes.ui.updateStatus("This ROM uses a mapper not supported by JSNES: " + this.getMapperName() + "(" + this.mapperType + ")"), null)
    }
}, JSNES.DummyUI = function(a) {
    this.nes = a, this.enable = function() {}, this.updateStatus = function() {}, this.writeAudio = function() {}, this.writeFrame = function() {}
}, "undefined" != typeof jQuery && ! function(a) {
    a.fn.JSNESUI = function(b) {
        var c = this,
            d = function(d) {
                var e = this;
                if (e.nes = d, e.root = a("<div></div>"), e.screen = a('<canvas class="nes-screen" width="256" height="240"></canvas>').appendTo(e.root), !e.screen[0].getContext) return void c.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                if (e.romContainer = a('<div class="nes-roms"></div>').appendTo(e.root), e.romSelect = a("<select></select>").appendTo(e.romContainer), e.controls = a('<div class="nes-controls"></div>').appendTo(e.root), e.buttons = {
                        pause: a('<input type="button" value="pause" class="nes-pause" disabled="disabled">').appendTo(e.controls),
                        restart: a('<input type="button" value="restart" class="nes-restart" disabled="disabled">').appendTo(e.controls),
                        sound: a('<input type="button" value="disable sound" class="nes-enablesound">').appendTo(e.controls),
                        zoom: a('<input type="button" value="zoom in" class="nes-zoom">').appendTo(e.controls)
                    }, e.status = a('<p class="nes-status" id="msg">Booting up...</p>').appendTo(e.root), e.root.appendTo(c), e.romSelect.change(function() {
                        e.loadROM()
                    }), e.buttons.pause.click(function() {
                        e.nes.isRunning ? (e.nes.stop(), e.updateStatus("Paused"), e.buttons.pause.attr("value", "resume")) : (e.nes.start(), e.buttons.pause.attr("value", "pause"))
                    }), e.buttons.restart.click(function() {
                        e.nes.reloadRom(), e.nes.start()
                    }), e.buttons.sound.click(function() {
                        e.nes.opts.emulateSound ? (e.nes.opts.emulateSound = !1, e.buttons.sound.attr("value", "enable sound")) : (e.nes.opts.emulateSound = !0, e.buttons.sound.attr("value", "disable sound"))
                    }), e.zoomed = !1, e.buttons.zoom.click(function() {
                        e.zoomed ? (e.screen.animate({
                            width: "256px",
                            height: "240px"
                        }), e.buttons.zoom.attr("value", "zoom in"), e.zoomed = !1) : (e.screen.animate({
                            width: "512px",
                            height: "480px"
                        }), e.buttons.zoom.attr("value", "zoom out"), e.zoomed = !0)
                    }), a.offset && e.screen.mousedown(function(a) {
                        e.nes.mmap && (e.nes.mmap.mousePressed = !0, e.nes.mmap.mouseX = a.pageX - e.screen.offset().left, e.nes.mmap.mouseY = a.pageY - e.screen.offset().top)
                    }).mouseup(function() {
                        setTimeout(function() {
                            e.nes.mmap && (e.nes.mmap.mousePressed = !1, e.nes.mmap.mouseX = 0, e.nes.mmap.mouseY = 0)
                        }, 500)
                    }), "undefined" != typeof b && e.setRoms(b), e.canvasContext = e.screen[0].getContext("2d"), !e.canvasContext.getImageData) return void c.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
             
                e.canvasImageData = e.canvasContext.getImageData(0, 0, 256, 240), e.resetCanvas(), a(document).bind("keydown", function(a) {
                    try{e.nes.input.keyDown(a)}catch(e){}
                }).bind("keyup", function(a) {
                    try{e.nes.input.keyUp(a)}catch(e){}
                }).bind("keypress", function(a) {
                    try{e.nes.input.keyPress(a)}catch(e){}
                }), a(window).bind("gamepadconnected", function(a) {
                    e.nes.input.gamepadConnected(a.gamepad)
                }).bind("gamepaddisconnected", function(a) {
                    e.nes.input.gamepadDisconnected(a.gamepad)
                });
                var f = window.AudioContext || window.webkitAudioContext;
                f ? e.audio = new f : (e.nes.opts.emulateSound = !1, e.buttons.sound.prop("disabled", !0))
                a(document).bind("keydown", function(a) {
		                    try{e.nes.input.keyDown(a)}catch(e){}
		                }).bind("keyup", function(a) {
		                    try{e.nes.input.keyUp(a)}catch(e){}
		                }).bind("keypress", function(a) {
		                    try{e.nes.input.keyPress(a)}catch(e){}
		                }), a(window).bind("gamepadconnected", function(a) {
		                    e.nes.input.gamepadConnected(a.gamepad)
		                }).bind("gamepaddisconnected", function(a) {
		                    e.nes.input.gamepadDisconnected(a.gamepad)
                });
                if (rom&&rom.match(/nes$/)){
                	e.loadROM(); // pf autoload
                } else {
                	document.getElementsByTagName("select")[0].style.display="inline";
                }
            };
        return d.prototype = {
            loadROM: function() {
                var b = this;
                b.updateStatus("Downloading..."), a.ajax({
                    url: (rom&&rom.match(/nes$/))?rom:escape(b.romSelect.val()),
                    xhr: function() {
                        var c = a.ajaxSettings.xhr();
                        return "undefined" != typeof c.overrideMimeType && c.overrideMimeType("text/plain; charset=x-user-defined"), b.xhr = c, c
                    },
                    complete: function(a) {
			var c;
			if (JSNES.Utils.isIE()) {
			    var d = JSNESBinaryToArray(a.responseBody).toArray();
			    c = String.fromCharCode.apply(void 0, d)
			} else c = a.responseText; // NOTE: Local file access required for file:/// protocol
			b.nes.loadRom(c), b.nes.start(), b.enable()
                    }
                })
            },
            resetCanvas: function() {
                this.canvasContext.fillStyle = "black", this.canvasContext.fillRect(0, 0, 256, 240);
                for (var a = 3; a < this.canvasImageData.data.length - 3; a += 4) this.canvasImageData.data[a] = 255
            },
            screenshot: function() {
                var a = this.screen[0].toDataURL("image/png"),
                    b = new Image;
                return b.src = a, b
            },
            enable: function() {
                this.buttons.pause.attr("disabled", null), this.nes.isRunning ? this.buttons.pause.attr("value", "pause") : this.buttons.pause.attr("value", "resume"), this.buttons.restart.attr("disabled", null), this.nes.opts.emulateSound ? this.buttons.sound.attr("value", "disable sound") : this.buttons.sound.attr("value", "enable sound")
            },
            updateStatus: function(a) {
                this.status.text(a)
            },
            setRoms: function(b) {
                this.romSelect.children().remove(), a("<option>Select a ROM...</option>").appendTo(this.romSelect);
                for (var c in b)
                    if (b.hasOwnProperty(c)) {
                        for (var d = a("<optgroup></optgroup>").attr("label", c), e = 0; e < b[c].length; e++) a("<option>" + b[c][e][0] + "</option>").attr("value", b[c][e][1]).appendTo(d);
                        this.romSelect.append(d)
                    }
            },
            writeAudio: function(a, b) {
                var c = this.audio.createBuffer(2, a.length, this.nes.papu.sampleRate);
                c.getChannelData(0).set(a), c.getChannelData(1).set(b);
                var d = this.audio.createBufferSource();
                d.buffer = c, d.connect(this.audio.destination), d.start(0)
            },
            writeFrame: function(a, b) {
                var c, d, e, f = this.canvasImageData.data;
                for (d = 0; 61440 > d; d++) c = a[d], c != b[d] && (e = 4 * d, f[e] = 255 & c, f[e + 1] = c >> 8 & 255, f[e + 2] = c >> 16 & 255, b[d] = c);
                this.canvasContext.putImageData(this.canvasImageData, 0, 0)
                if(usingGamepad)checkGamepad(usingTouch)
            }
        }, d
    }
}(jQuery);