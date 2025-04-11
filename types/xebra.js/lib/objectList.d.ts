export const PARAMETER_ATTR: Readonly<{
    CUSTOM_UNITS: "_parameter_units";
    EXPONENT: "_parameter_exponent";
    LONGNAME: "_parameter_longname";
    RANGE: "_parameter_range";
    SHORTNAME: "_parameter_shortname";
    STEPS: "_parameter_steps";
    TYPE: "_parameter_type";
    UNIT_STYLE: "_parameter_unitstyle";
}>;

export const OBJECTS: Readonly<{
    BUTTON: "button";
    COMMENT: "comment";
    DIAL: "dial";
    FLONUM: "flonum";
    FPIC: "fpic";
    GAIN: "gain~";
    KSLIDER: "kslider";
    LIVE_BUTTON: "live.button";
    LIVE_DIAL: "live.dial";
    LIVE_GRID: "live.grid";
    LIVE_NUMBOX: "live.numbox";
    LIVE_SLIDER: "live.slider";
    LIVE_TAB: "live.tab";
    LIVE_TEXT: "live.text";
    LIVE_TOGGLE: "live.toggle";
    MESSAGE: "message";
    METER: "meter~";
    MIRA_CHANNEL: "mira.channel";
    MIRA_FRAME: "mira.frame";
    MIRA_MOTION: "mira.motion";
    MIRA_MULTITOUCH: "mira.multitouch";
    MULTISLIDER: "multislider";
    NUMBER: "number";
    PATCHER: "jpatcher";
    PATCHERVIEW: "patcherview";
    PANEL: "panel";
    RSLIDER: "rslider";
    SLIDER: "slider";
    SWATCH: "swatch";
    TOGGLE: "toggle";
    UMENU: "umenu";
}>;

export const MANDATORY_OBJECTS: Readonly<Record<string, string[]>>;

export const DEFAULT_PARAMS: string[];

export const OBJECT_PARAMETERS: Readonly<Record<string, string[]>>;

export const OPTIONAL_OBJECT_PARAMETERS: Readonly<Record<string, string[]>>;
