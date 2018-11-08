export default function byteToBinary(byte) {
    return byte.toString(2).padStart(8, "0");
};