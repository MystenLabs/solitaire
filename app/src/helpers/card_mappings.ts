import { svgs } from '../../public/assets';

const mappings = new Map<number, any>([
    // Clubs (0-12)
    [0, svgs.club_ace],
    [1, svgs.club_number],
    [10, svgs.club_jack],
    [11, svgs.club_queen],
    [12, svgs.club_king],
    // Spades (13-25)
    [13, svgs.spade_ace],
    [14, svgs.spade_number],
    [23, svgs.spade_jack],
    [24, svgs.spade_queen],
    [25, svgs.spade_king],
    // Hearts (26-38)
    [26, svgs.heart_ace],
    [27, svgs.heart_number],
    [36, svgs.heart_jack],
    [37, svgs.heart_queen],
    [38, svgs.heart_king],
    // Diamonds (39-51)
    [39, svgs.diamond_ace],
    [40, svgs.diamond_number],
    [49, svgs.diamond_jack],
    [50, svgs.diamond_queen],
    [51, svgs.diamond_king],
]);

/// Converts a card id to a svg
export function cardIdToSvg(cardId: number) {
    return mappings.get(cardId);
}
