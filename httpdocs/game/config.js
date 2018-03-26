//  CONFIG
var config = {
	
	//  Debug
	debug:			false,
	alert:			false,
	
	//  IDs
	ids:	{
		container:		'bmz-game',
		levelScreen:	'bmz-screen-level',
		canvas:			'bmz-level-canvas',
		menu:			'bmz-level-menu',
		score:			'bmz-level-score',
		pauseBtn:		'bmz-level-pause',
		compromiseBtn:	'bmz-level-compromise',
		cliffBtn:		'bmz-level-cliff',
		filibusterBtn:	'bmz-level-filibuster',
		damage:			'bmz-level-damage',
		startScreen:	'bmz-screen-start',
		loader:			'bmz-start-loader',
		compatibility:	'bmz-compatibility'
	},
	
	//  Classes
	classes: {
		start:		'start',
		level:		'level',
		pause:		'pause',
		end:		'end',
		stop:		'stop',
		restart:	'restart',
		label:		'label',
		num:		'num',
		open:		'open',
		mask:		'mask',
		loading:	'loading',
		running:	'running',
		sponsor:	'sponsor',
		down:		'down',
		overlay:	'overlay',
		paused:		'paused',
		input:		'input',
		enemy:		'enemy',
		building:	'building',
		hidden:		'hidden'
	},
	
	//  Image sizes
	sizes:	{
		attackerSprite:	{
			width: 	7921,
			height:	721	
		},
		footSprite:	{
			width:	2592,
			height:	3888
		}
	},
	
	//  Images
	images: {
		
		start:	{
			background:			"game/img/screen-start.svg",
			logo:				"game/img/logo.svg",
			ballotBox:			"game/img/ballot-box.svg",
			ballot:				"game/img/ballot.svg",
			ballotUnchecked:	"game/img/ballot-option-unchecked.svg",
			ballotChecked:		"game/img/ballot-option-checked.svg",
			btnActive:			"game/img/btn-active.svg"
		},
		
		levels:	{
			score:					"game/img/screen-level-score.svg",
			menu:					"game/img/screen-level-menu.svg",
			crack:					"game/img/screen-level-wall-crack.svg",
			hole:					"game/img/screen-level-wall-hole.svg",
			cliff:					"game/img/screen-level-cliff.svg",
			btnPauseLibUp:			"game/img/btn-recess-liberal-up.svg",
			btnPauseLibDown:		"game/img/btn-recess-liberal-down.svg",
			btnPauseConUp:			"game/img/btn-recess-conservative-up.svg",
			btnPauseConDown:		"game/img/btn-recess-conservative-down.svg",
			btnConveneLib:			"game/img/btn-convene-liberal.svg",
			btnConveneCon:			"game/img/btn-convene-conservative.svg",
			btnCompromiseLibUp:		"game/img/btn-compromise-liberal-up.svg",
			btnCompromiseConUp:		"game/img/btn-compromise-conservative-up.svg",
			btnCompromiseDown:		"game/img/btn-compromise-down.svg",
			btnCliffLibUp:			"game/img/btn-cliff-liberal-up.svg",
			btnCliffConUp:			"game/img/btn-cliff-conservative-up.svg",
			btnCliffDown:			"game/img/btn-cliff-down.svg",
			btnFilibusterLibUp:		"game/img/btn-filibuster-liberal-up.svg",
			btnFilibusterConUp:		"game/img/btn-filibuster-conservative-up.svg",
			btnFilibusterDown:		"game/img/btn-filibuster-down.svg",
			btnRestartCon:			"game/img/btn-restart-conservative.svg",
			btnRestartLib:			"game/img/btn-restart-liberal.svg",
			damageBar:				"game/img/screen-level-bar.svg",
			damageMask:				"game/img/screen-level-bar-mask.svg",
			foot:					"game/img/foot.svg",
			footAlt:				"game/img/foot.png"
		},
		
		liberal:	{
			background:		"game/img/screen-level-liberal.svg",
			attacker:		"game/img/sprite-conservative.svg",
			attackerAlt:	"game/img/sprite-conservative.png"
		},
		
		conservative:	{
			background:		"game/img/screen-level-conservative.svg",
			attacker:		"game/img/sprite-liberal.svg",
			attackerAlt:	"game/img/sprite-liberal.png"
		}
	
	},
	
	//  Audio
	audio: {
	
		//  Start screen sounds
		start:	{
			background:		"game/audio/bg-screen-start.ogg",
			woosh:			"game/audio/woosh.ogg",
			ballotCheck:	"game/audio/ballot-check.ogg",
			ballotPlay:		"game/audio/ballot-play.ogg",
			paper:			"game/audio/paper.ogg"
		},
		
		//  Level sounds
		level:	{
			background:		"game/audio/bg-screen-level.ogg",
			button:			"game/audio/button.ogg",
			btnDisallowed:	"game/audio/btn-disallowed.ogg",
			btnEnabled:		"game/audio/btn-enabled.ogg",
			btnCompromise:	"game/audio/btn-compromise.ogg",
			wallHit:		"game/audio/attacker-wall-hit.ogg",
			cliff:			"game/audio/cliff.ogg",
			crack:			"game/audio/crack.ogg",
			hole:			"game/audio/hole.ogg",
			foot:			"game/audio/foot.ogg"
		},
		
		//  Liberal voices
		conservative:	{
			walking:		[
				"game/audio/attacker-liberal-walking1.ogg",
				"game/audio/attacker-liberal-walking2.ogg",
				"game/audio/attacker-liberal-walking3.ogg",
				"game/audio/attacker-liberal-walking4.ogg"
			],
			dragging:	[
				"game/audio/attacker-liberal-dragging1.ogg",
				"game/audio/attacker-liberal-dragging2.ogg",
				"game/audio/attacker-liberal-dragging3.ogg"
			],
			lying:	[
				"game/audio/attacker-liberal-lying1.ogg",
				"game/audio/attacker-liberal-lying2.ogg"
			],
			dead:	[
				"game/audio/attacker-liberal-dead1.ogg",
				"game/audio/attacker-liberal-dead2.ogg",
				"game/audio/attacker-liberal-dead3.ogg",
				"game/audio/attacker-liberal-dead4.ogg"
			],
			striking:	[
				"game/audio/attacker-liberal-striking1.ogg",
				"game/audio/attacker-liberal-striking2.ogg"
			]
		},
		
		//  Conservative voices
		liberal:	{
			walking:		[
				"game/audio/attacker-conservative-walking1.ogg",
				"game/audio/attacker-conservative-walking2.ogg",
				"game/audio/attacker-conservative-walking3.ogg",
				"game/audio/attacker-conservative-walking4.ogg"
			],
			dragging:	[
				"game/audio/attacker-conservative-dragging1.ogg",
				"game/audio/attacker-conservative-dragging2.ogg",
				"game/audio/attacker-conservative-dragging3.ogg"
			],
			lying:	[
				"game/audio/attacker-conservative-lying1.ogg",
				"game/audio/attacker-conservative-lying2.ogg"
			],
			dead:	[
				"game/audio/attacker-conservative-dead1.ogg",
				"game/audio/attacker-conservative-dead2.ogg",
				"game/audio/attacker-conservative-dead3.ogg",
				"game/audio/attacker-conservative-dead4.ogg"
			],
			striking:	[
				"game/audio/attacker-conservative-striking1.ogg",
				"game/audio/attacker-conservative-striking2.ogg"
			]
		}
		
	}
	
};