/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { open } from '../ui/Dialog';

const register = function (editor) {
  editor.addCommand('mcePreview', function () {
    open(editor);
  });
};

export { register };
