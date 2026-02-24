import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import PlacesScreen from '../src/components/PlacesScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/places'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <PlacesScreen />
    </SSRPage>
  );
}
