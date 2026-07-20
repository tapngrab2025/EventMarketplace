declare module "react-slick" {
  import * as React from "react";

  export type ResponsiveObject = {
    breakpoint: number;
    settings: Settings | "unslick";
  };

  export interface Settings {
    arrows?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    className?: string;
    dots?: boolean;
    infinite?: boolean;
    responsive?: ResponsiveObject[];
    slidesToScroll?: number;
    slidesToShow?: number;
    speed?: number;
    swipeToSlide?: boolean;
    children?: React.ReactNode;
  }

  export default class Slider extends React.Component<Settings> {
    slickGoTo(slideNumber: number, dontAnimate?: boolean): void;
    slickNext(): void;
    slickPrev(): void;
  }
}
