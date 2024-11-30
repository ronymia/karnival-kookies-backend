import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/Users/user.route';
import { DashboardRoutes } from '../modules/Dashboard/dashboard.route';
import { CartRoutes } from '../modules/Carts/cart.route';
import { PaymentRoutes } from '../modules/Payments/payment.route';
import { CategoryRoutes } from '../modules/Categories/categories.route';
import { DiscountRoutes } from '../modules/Discounts/discount.route';
import { FaqRoutes } from '../modules/Faq/faq.route';
import { RatingRoutes } from '../modules/Ratings/rating.route';
import { MessageRoutes } from '../modules/Messages/message.route';
import { ProductRoutes } from '../modules/Products/product.route';
import { PackageRoutes } from '../modules/Package/package.route';
import { SubscribersRoutes } from '../modules/Subscribers/subscribers.route';
import { FavoriteProductRoutes } from '../modules/FavoriteProduct/favoriteProduct.route';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  // {
  //   path: '/permissions',
  //   route: PermissionRoutes,
  // },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/carts',
    route: CartRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/faqs',
    route: FaqRoutes,
  },
  {
    path: '/discounts',
    route: DiscountRoutes,
  },
  {
    path: '/ratings',
    route: RatingRoutes,
  },
  {
    path: '/packages',
    route: PackageRoutes,
  },
  {
    path: '/subscribers',
    route: SubscribersRoutes,
  },
  {
    path: '/favorite-products',
    route: FavoriteProductRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
