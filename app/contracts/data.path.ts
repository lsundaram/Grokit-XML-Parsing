/// <reference path="data.type.ts"/>

module Data {
    export class Path {
        static RAW_TYPE_STRING = 0;
        static RAW_TYPE_INTEGER = 1;
        static RAW_TYPE_FLOAT = 2;

        path: string;
        stats: {
            min: number,
            max: number,
            rawType: number,
            count: number,
            hasNull: boolean,
            // map key paths to their cardinalities
            //map: Object,
        };

        get type(): number {
            return this.stats.rawType;
        }

        set type(type: number) {
            this.stats.rawType = type;
        }

        constructor(path: string) {
            this.path = path;
            this.stats = {
                min: 0,
                max: 0,
                rawType: Path.RAW_TYPE_INTEGER,
                count: 0,
                hasNull: false,
                // map key paths to their cardinalities
            //    map: {},
            };
        }

        saveProperType(value: any) {
            if (value === null) {
                this.stats.hasNull = true;
                return value;
            }
            if (typeof value == 'string') {
                var valNumeric = parseFloat(value);
                var rounded = Math.round(valNumeric);
                if (isNaN(valNumeric)) {
                    this.type = Path.RAW_TYPE_STRING;
                    return value;
                } else if (rounded != valNumeric) {
                    this.type = Path.RAW_TYPE_FLOAT;
                    return valNumeric;
                } else {
                    return rounded;
                }
            }
            return value;
        }

        numerics(value: any) {
            this.stats.min = Math.min(value, this.stats.min);
            this.stats.max = Math.max(value, this.stats.max);
        }

        foundValue(value: any) {
            // increment count
            this.stats.count++;

            // increase cardinality
            //this.stats.map[value] = this.stats.hasOwnProperty(value) ? this.stats.map[value] + 1 : 1;

            // Calculate numeric-only properties
            if (this.type != Path.RAW_TYPE_STRING) {
                value = this.saveProperType(value);

                if (this.type != Path.RAW_TYPE_STRING) {
                    this.numerics(value);
                }
            }
        }

        percentUnique(): number {
            return 100;//Object.keys(this.stats.map).length / this.stats.count * 100;
        }
    }
}
