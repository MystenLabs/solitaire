import { svgs } from '../../public/assets';

const mappings = new Map<number, any>([
    [-1, svgs.card_back],
    // Clubs (0-12)
    [0, svgs.clubs_ace], [1, svgs.clubs_2], [2, svgs.clubs_3], [3, svgs.clubs_4], [4, svgs.clubs_5],
    [5, svgs.clubs_6], [6, svgs.clubs_7], [7, svgs.clubs_8], [8, svgs.clubs_9], [9, svgs.clubs_10],
    [10, svgs.clubs_jack], [11, svgs.clubs_queen], [12, svgs.clubs_king],
    // Spades (13-25)
    [13, svgs.spades_ace], [14, svgs.spades_2], [15, svgs.spades_3], [16, svgs.spades_4], [17, svgs.spades_5],
    [18, svgs.spades_6], [19, svgs.spades_7], [20, svgs.spades_8], [21, svgs.spades_9], [22, svgs.spades_10],
    [23, svgs.spades_jack], [24, svgs.spades_queen], [25, svgs.spades_king],
    // Hearts (26-38)
    [26, svgs.hearts_ace], [27, svgs.hearts_2], [28, svgs.hearts_3], [29, svgs.hearts_4], [30, svgs.hearts_5],
    [31, svgs.hearts_6], [32, svgs.hearts_7], [33, svgs.hearts_8], [34, svgs.hearts_9], [35, svgs.hearts_10],
    [36, svgs.hearts_jack], [37, svgs.hearts_queen], [38, svgs.hearts_king],
    // Diamonds (39-51)
    [39, svgs.diamonds_ace], [40, svgs.diamonds_2], [41, svgs.diamonds_3], [42, svgs.diamonds_4], [43, svgs.diamonds_5],
    [44, svgs.diamonds_6], [45, svgs.diamonds_7], [46, svgs.diamonds_8], [47, svgs.diamonds_9], [48, svgs.diamonds_10],
    [49, svgs.diamonds_jack], [50, svgs.diamonds_queen], [51, svgs.diamonds_king],
]);

/// Converts a card id to a svg
export function cardIdToSvg(cardId: number) {
    return mappings.get(cardId);
}
