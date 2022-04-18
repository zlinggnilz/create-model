interface configProps {
  request?: any;
}

const defaultConfig: configProps = {};

const config = ({ request }: configProps) => {
  defaultConfig.request = request;
};

export { config, defaultConfig };
