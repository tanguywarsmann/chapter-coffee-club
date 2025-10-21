import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useState, useEffect } from "react";

export default function Landing() {
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    left: number;
    top: number;
    size: number;
    color: string;
    rotation: number;
    duration: number;
    delay: number;
  }>>([]);

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      
      // Générer 100 confettis partout sur l'écran
      const colors = ['#EEDCC8', '#F5E6D3', '#FFD700', '#FFA500', '#FF6B35', '#FFFFFF', '#B85C38'];
      const newConfetti = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // 0-100%
        top: Math.
